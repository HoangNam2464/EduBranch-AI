#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

const ALLOWED_STATUSES = new Set(['PROPOSED', 'APPROVED', 'CHANGES_REQUESTED']);
const PLACEHOLDER_APPROVER_VALUES = new Set(['—', '-', '–', '--', 'n/a', 'tbd']);

function isPlaceholderOrEmpty(val) {
  const s = (val || '').trim();
  if (!s) return true;
  return PLACEHOLDER_APPROVER_VALUES.has(s.toLowerCase());
}

function isValidCalendarDate(str) {
  const s = (str || '').trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return false;
  const year = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  const day = parseInt(m[3], 10);
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() + 1 === month &&
    d.getUTCDate() === day
  );
}

function normalizeWs(s) {
  return (s || '').trim().replace(/\s+/g, ' ');
}

function toRelative(p) {
  return path.relative(repoRoot, p).replace(/\\/g, '/');
}

// Parse CLI arguments
const args = process.argv.slice(2);
let isRelease = false;
let localesArg = null;
const registryArgs = [];

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--release') {
    isRelease = true;
  } else if (arg === '--locales') {
    if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
      localesArg = args[++i];
    }
  } else if (arg === '--registries') {
    while (i + 1 < args.length && !args[i + 1].startsWith('--')) {
      registryArgs.push(args[++i]);
    }
  }
}

// Determine registries
const registryFiles = [];
if (registryArgs.length > 0) {
  for (const r of registryArgs) {
    const fullPath = path.isAbsolute(r) ? r : path.resolve(process.cwd(), r);
    if (fs.existsSync(fullPath)) {
      if (fs.statSync(fullPath).isDirectory()) {
        const entries = fs.readdirSync(fullPath, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isFile() && entry.name.endsWith('.md')) {
            registryFiles.push(path.resolve(fullPath, entry.name));
          }
        }
      } else {
        registryFiles.push(fullPath);
      }
    } else {
      registryFiles.push(fullPath);
    }
  }
} else {
  // Discover default registries: specs/*/l10n-copy-review.md and docs/l10n/*.md
  const specsDir = path.resolve(repoRoot, 'specs');
  if (fs.existsSync(specsDir) && fs.statSync(specsDir).isDirectory()) {
    const entries = fs.readdirSync(specsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const candidate = path.resolve(specsDir, entry.name, 'l10n-copy-review.md');
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
          registryFiles.push(candidate);
        }
      }
    }
  }
  const docsL10nDir = path.resolve(repoRoot, 'docs', 'l10n');
  if (fs.existsSync(docsL10nDir) && fs.statSync(docsL10nDir).isDirectory()) {
    const entries = fs.readdirSync(docsL10nDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        registryFiles.push(path.resolve(docsL10nDir, entry.name));
      }
    }
  }
}
registryFiles.sort();

// Findings array: { code, key, target, isError }
const findings = [];

// Parse registries
// registryMap: key -> { viCopy, enCopy, status, approvedBy, approvedOn, source, file }
const registryMap = new Map();
const seenKeysInRegistry = new Set();

for (const regFile of registryFiles) {
  if (!fs.existsSync(regFile)) {
    continue;
  }
  let content;
  try {
    content = fs.readFileSync(regFile, 'utf8');
  } catch (err) {
    console.error(`UNREADABLE_FILE: ${toRelative(regFile)}: ${err.message}`);
    process.exit(2);
  }

  const displayTarget = toRelative(regFile);
  const lines = content.split(/\r?\n/);
  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const lineNum = lineIdx + 1;
    const line = lines[lineIdx];
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) continue;
    const isDataRow = /^\|\s*`/.test(trimmed);

    if (!trimmed.endsWith('|') || trimmed.endsWith('\\|')) {
      if (isDataRow) {
        const rawCells = trimmed.split(/(?<!\\)\|/);
        const cells = rawCells.slice(1).map(c => c.replace(/\\\|/g, '|').trim());
        findings.push({
          code: 'MALFORMED_REGISTRY_ROW',
          key: `${displayTarget}:${lineNum}`,
          target: `(${cells.length} cells)`,
          isError: true
        });
      }
      continue;
    }

    const rawCells = trimmed.split(/(?<!\\)\|/);
    const cells = rawCells.slice(1, -1).map(c => c.replace(/\\\|/g, '|').trim());

    if (isDataRow && cells.length !== 7) {
      findings.push({
        code: 'MALFORMED_REGISTRY_ROW',
        key: `${displayTarget}:${lineNum}`,
        target: `(${cells.length} cells)`,
        isError: true
      });
      continue;
    }

    if (cells.length < 7) continue;

    // Skip table header or separator rows
    if (cells[0].toLowerCase() === 'key' || cells[0].startsWith('---') || cells.every(c => /^:?-+:?$/.test(c))) {
      continue;
    }

    let key = cells[0];
    if (key.startsWith('`') && key.endsWith('`')) {
      key = key.slice(1, -1).trim();
    }
    if (!key) continue;

    const viCopy = cells[1];
    const enCopy = cells[2];
    const status = cells[3];
    const approvedBy = cells[4];
    const approvedOn = cells[5];
    const source = cells[6];

    // Duplicate check
    if (seenKeysInRegistry.has(key)) {
      findings.push({
        code: 'DUPLICATE',
        key,
        target: displayTarget,
        isError: true
      });
      continue;
    }
    seenKeysInRegistry.add(key);

    // Bad status check
    if (!ALLOWED_STATUSES.has(status)) {
      findings.push({
        code: 'BAD_STATUS',
        key,
        target: displayTarget,
        isError: true
      });
    }

    // Approval checks
    if (status === 'APPROVED') {
      const missing = [];
      if (isPlaceholderOrEmpty(approvedBy)) {
        missing.push('approved_by');
      }
      if (!isValidCalendarDate(approvedOn)) {
        missing.push('approved_on');
      }
      if (missing.length > 0) {
        findings.push({
          code: 'APPROVAL_INCOMPLETE',
          key,
          target: `${displayTarget} (${missing.join(', ')})`,
          isError: true
        });
      }
      if ((enCopy || '').trim() === '') {
        findings.push({
          code: 'EMPTY_TRANSLATION',
          key,
          target: displayTarget,
          isError: true
        });
      }
    } else {
      const hasFilledBy = !isPlaceholderOrEmpty(approvedBy);
      const hasFilledOn = !isPlaceholderOrEmpty(approvedOn);
      if (hasFilledBy || hasFilledOn) {
        findings.push({
          code: 'APPROVAL_FIELDS_WITHOUT_APPROVED',
          key,
          target: displayTarget,
          isError: false
        });
      }
    }

    registryMap.set(key, {
      viCopy,
      enCopy,
      status,
      approvedBy,
      approvedOn,
      source,
      file: displayTarget
    });
  }
}

// Determine locales dir
const localesDir = localesArg
  ? (path.isAbsolute(localesArg) ? localesArg : path.resolve(process.cwd(), localesArg))
  : path.resolve(repoRoot, 'frontend/src/locales');
const displayLocalesDir = localesArg || toRelative(localesDir);

const enKeys = new Map(); // key -> { value, file }

if (!fs.existsSync(localesDir) || !fs.statSync(localesDir).isDirectory()) {
  findings.push({
    code: 'NO_LOCALES:',
    key: displayLocalesDir,
    target: '',
    isError: isRelease
  });
} else {
  // Read and flatten locale files
  const localeEntries = fs.readdirSync(localesDir, { withFileTypes: true });
  const enFiles = localeEntries
    .filter(e => e.isFile() && (e.name === 'en.json' || e.name.endsWith('.en.json')))
    .map(e => path.resolve(localesDir, e.name))
    .sort();

  if (enFiles.length === 0) {
    findings.push({
      code: 'NO_EN_LOCALES',
      key: displayLocalesDir,
      target: '',
      isError: isRelease
    });
  } else {
    function flattenObj(obj, prefix, relFile) {
      if (obj !== null && typeof obj === 'object') {
        if (Array.isArray(obj)) {
          for (let i = 0; i < obj.length; i++) {
            const itemKey = prefix ? `${prefix}.${i}` : String(i);
            flattenObj(obj[i], itemKey, relFile);
          }
        } else {
          for (const [k, v] of Object.entries(obj)) {
            const fullKey = prefix ? `${prefix}.${k}` : k;
            flattenObj(v, fullKey, relFile);
          }
        }
      } else if (typeof obj === 'string') {
        if (obj.trim() === '') {
          findings.push({
            code: 'EMPTY_TRANSLATION',
            key: prefix,
            target: relFile,
            isError: true
          });
        }
        if (enKeys.has(prefix)) {
          const existing = enKeys.get(prefix);
          findings.push({
            code: 'DUPLICATE_LOCALE_KEY',
            key: prefix,
            target: `${existing.file} ${relFile}`,
            isError: true
          });
        } else {
          enKeys.set(prefix, { value: obj, file: relFile });
        }
      } else {
        findings.push({
          code: 'NON_STRING_LEAF',
          key: prefix,
          target: relFile,
          isError: true
        });
      }
    }

    for (const enFile of enFiles) {
      let content;
      const relFile = toRelative(enFile);
      try {
        content = fs.readFileSync(enFile, 'utf8');
      } catch (err) {
        console.error(`UNREADABLE_FILE: ${relFile}: ${err.message}`);
        process.exit(2);
      }
      let json;
      try {
        json = JSON.parse(content);
      } catch (err) {
        console.error(`INVALID_JSON: ${relFile}: ${err.message}`);
        console.log(`INVALID_JSON: ${relFile}: ${err.message}`);
        process.exit(2);
      }
      flattenObj(json, '', relFile);
    }

    if (enKeys.size === 0) {
      findings.push({
        code: 'NO_EN_KEYS',
        key: displayLocalesDir,
        target: '',
        isError: isRelease
      });
    } else {
      // Compare enKeys against registry
      for (const [key, data] of enKeys) {
        if (!registryMap.has(key)) {
          findings.push({
            code: 'UNREGISTERED',
            key,
            target: data.file,
            isError: true
          });
        } else {
          const reg = registryMap.get(key);
          if (isRelease) {
            if (reg.status !== 'APPROVED') {
              findings.push({
                code: 'NOT_APPROVED',
                key,
                target: reg.file,
                isError: true
              });
            }
            if (normalizeWs(data.value) !== normalizeWs(reg.enCopy)) {
              findings.push({
                code: 'CHANGED',
                key,
                target: data.file,
                isError: true
              });
            }
          } else {
            if (reg.status === 'PROPOSED') {
              findings.push({
                code: 'PROPOSED',
                key,
                target: reg.file,
                isError: false
              });
            } else if (reg.status === 'CHANGES_REQUESTED') {
              findings.push({
                code: 'CHANGES_REQUESTED',
                key,
                target: reg.file,
                isError: false
              });
            }
          }
        }
      }

      // Stale registry keys (in registry but not in any en file)
      for (const [key, reg] of registryMap) {
        if (!enKeys.has(key)) {
          findings.push({
            code: 'STALE',
            key,
            target: reg.file,
            isError: false
          });
        }
      }
    }
  }
}

// Print findings
for (const f of findings) {
  if (f.target) {
    console.log(`${f.code} ${f.key} ${f.target}`);
  } else {
    console.log(`${f.code} ${f.key}`);
  }
}

const totalEnKeys = enKeys.size;
const totalRegistered = registryMap.size;
let totalApproved = 0;
for (const reg of registryMap.values()) {
  if (reg.status === 'APPROVED') {
    totalApproved++;
  }
}

const errorCount = findings.filter(f => f.isError).length;
const warningCount = findings.filter(f => !f.isError).length;
const modeStr = isRelease ? 'release' : 'dev';

console.log(
  `l10n-approval: ${totalEnKeys} en keys, ${totalRegistered} registered, ${totalApproved} approved, ${errorCount} errors, ${warningCount} warnings (mode: ${modeStr})`
);

process.exit(errorCount > 0 ? 1 : 0);
