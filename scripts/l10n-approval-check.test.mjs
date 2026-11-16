import { test } from 'node:test';
import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptPath = path.resolve(__dirname, 'l10n-approval-check.mjs');
const fixturesRoot = path.resolve(__dirname, '__fixtures__/l10n');

function runCheck(fixtureName, isRelease = false) {
  const locales = path.join(fixturesRoot, fixtureName, 'locales');
  const registries = path.join(fixturesRoot, fixtureName, 'registries');
  const args = [scriptPath, '--locales', locales, '--registries', registries];
  if (isRelease) args.push('--release');
  const res = spawnSync(process.execPath, args, { encoding: 'utf8' });
  return {
    status: res.status,
    stdout: res.stdout || '',
    stderr: res.stderr || ''
  };
}

function runWithArgs(extraArgs) {
  const res = spawnSync(process.execPath, [scriptPath, ...extraArgs], { encoding: 'utf8' });
  return {
    status: res.status,
    stdout: res.stdout || '',
    stderr: res.stderr || ''
  };
}

test('valid-approved: dev exits 0, release exits 0', () => {
  const dev = runCheck('valid-approved', false);
  assert.strictEqual(dev.status, 0);
  assert.match(dev.stdout, /0 errors/);

  const rel = runCheck('valid-approved', true);
  assert.strictEqual(rel.status, 0);
  assert.match(rel.stdout, /0 errors/);
});

test('valid-proposed: dev exits 0 (warning PROPOSED), release exits 1 (NOT_APPROVED)', () => {
  const dev = runCheck('valid-proposed', false);
  assert.strictEqual(dev.status, 0);
  assert.match(dev.stdout, /\bPROPOSED\b/);

  const rel = runCheck('valid-proposed', true);
  assert.strictEqual(rel.status, 1);
  assert.match(rel.stdout, /\bNOT_APPROVED\b/);
});

test('unregistered: dev exits 1, release exits 1 (UNREGISTERED)', () => {
  const dev = runCheck('unregistered', false);
  assert.strictEqual(dev.status, 1);
  assert.match(dev.stdout, /\bUNREGISTERED\b/);

  const rel = runCheck('unregistered', true);
  assert.strictEqual(rel.status, 1);
  assert.match(rel.stdout, /\bUNREGISTERED\b/);
});

test('duplicate: dev exits 1, release exits 1 (DUPLICATE)', () => {
  const dev = runCheck('duplicate', false);
  assert.strictEqual(dev.status, 1);
  assert.match(dev.stdout, /\bDUPLICATE\b/);

  const rel = runCheck('duplicate', true);
  assert.strictEqual(rel.status, 1);
  assert.match(rel.stdout, /\bDUPLICATE\b/);
});

test('bad-status: dev exits 1, release exits 1 (BAD_STATUS)', () => {
  const dev = runCheck('bad-status', false);
  assert.strictEqual(dev.status, 1);
  assert.match(dev.stdout, /\bBAD_STATUS\b/);

  const rel = runCheck('bad-status', true);
  assert.strictEqual(rel.status, 1);
  assert.match(rel.stdout, /\bBAD_STATUS\b/);
});

test('changed-after-approval: dev exits 0, release exits 1 (CHANGED)', () => {
  const dev = runCheck('changed-after-approval', false);
  assert.strictEqual(dev.status, 0);

  const rel = runCheck('changed-after-approval', true);
  assert.strictEqual(rel.status, 1);
  assert.match(rel.stdout, /\bCHANGED\b/);
});

test('non-string-leaf: dev exits 1, release exits 1 (NON_STRING_LEAF)', () => {
  const dev = runCheck('non-string-leaf', false);
  assert.strictEqual(dev.status, 1);
  assert.match(dev.stdout, /\bNON_STRING_LEAF\b/);

  const rel = runCheck('non-string-leaf', true);
  assert.strictEqual(rel.status, 1);
  assert.match(rel.stdout, /\bNON_STRING_LEAF\b/);
});

test('array-keys: dev exits 0, release exits 0', () => {
  const dev = runCheck('array-keys', false);
  assert.strictEqual(dev.status, 0);
  assert.match(dev.stdout, /0 errors/);

  const rel = runCheck('array-keys', true);
  assert.strictEqual(rel.status, 0);
  assert.match(rel.stdout, /0 errors/);
});

test('invalid-json: dev exits 2, release exits 2 (INVALID_JSON)', () => {
  const dev = runCheck('invalid-json', false);
  assert.strictEqual(dev.status, 2);
  assert.match(dev.stdout + dev.stderr, /\bINVALID_JSON\b/);

  const rel = runCheck('invalid-json', true);
  assert.strictEqual(rel.status, 2);
  assert.match(rel.stdout + rel.stderr, /\bINVALID_JSON\b/);
});

test('empty-locales-dir: dev exits 0, release exits 1 (NO_EN_LOCALES)', () => {
  const dev = runCheck('empty-locales-dir', false);
  assert.strictEqual(dev.status, 0);
  assert.match(dev.stdout, /\bNO_EN_LOCALES\b/);

  const rel = runCheck('empty-locales-dir', true);
  assert.strictEqual(rel.status, 1);
  assert.match(rel.stdout, /\bNO_EN_LOCALES\b/);
});

test('approved-missing-by: dev exits 1, release exits 1 (APPROVAL_INCOMPLETE)', () => {
  const dev = runCheck('approved-missing-by', false);
  assert.strictEqual(dev.status, 1);
  assert.match(dev.stdout, /\bAPPROVAL_INCOMPLETE\b/);
  assert.match(dev.stdout, /\(approved_by\)/);

  const rel = runCheck('approved-missing-by', true);
  assert.strictEqual(rel.status, 1);
  assert.match(rel.stdout, /\bAPPROVAL_INCOMPLETE\b/);
  assert.match(rel.stdout, /\(approved_by\)/);
});

test('approved-missing-on: dev exits 1, release exits 1 (APPROVAL_INCOMPLETE)', () => {
  const dev = runCheck('approved-missing-on', false);
  assert.strictEqual(dev.status, 1);
  assert.match(dev.stdout, /\bAPPROVAL_INCOMPLETE\b/);
  assert.match(dev.stdout, /\(approved_on\)/);

  const rel = runCheck('approved-missing-on', true);
  assert.strictEqual(rel.status, 1);
  assert.match(rel.stdout, /\bAPPROVAL_INCOMPLETE\b/);
  assert.match(rel.stdout, /\(approved_on\)/);
});

test('approved-bad-date: dev exits 1, release exits 1 (APPROVAL_INCOMPLETE)', () => {
  const dev = runCheck('approved-bad-date', false);
  assert.strictEqual(dev.status, 1);
  assert.match(dev.stdout, /\bAPPROVAL_INCOMPLETE\b/);
  assert.match(dev.stdout, /\(approved_on\)/);

  const rel = runCheck('approved-bad-date', true);
  assert.strictEqual(rel.status, 1);
  assert.match(rel.stdout, /\bAPPROVAL_INCOMPLETE\b/);
  assert.match(rel.stdout, /\(approved_on\)/);
});

test('approved-placeholder-by: dev exits 1, release exits 1 (APPROVAL_INCOMPLETE)', () => {
  const dev = runCheck('approved-placeholder-by', false);
  assert.strictEqual(dev.status, 1);
  assert.match(dev.stdout, /\bAPPROVAL_INCOMPLETE\b/);
  assert.match(dev.stdout, /\(approved_by\)/);

  const rel = runCheck('approved-placeholder-by', true);
  assert.strictEqual(rel.status, 1);
  assert.match(rel.stdout, /\bAPPROVAL_INCOMPLETE\b/);
  assert.match(rel.stdout, /\(approved_by\)/);
});

test('proposed-with-approval-fields: dev exits 0 (warning APPROVAL_FIELDS_WITHOUT_APPROVED), release exits 1 (NOT_APPROVED)', () => {
  const dev = runCheck('proposed-with-approval-fields', false);
  assert.strictEqual(dev.status, 0);
  assert.match(dev.stdout, /\bAPPROVAL_FIELDS_WITHOUT_APPROVED\b/);

  const rel = runCheck('proposed-with-approval-fields', true);
  assert.strictEqual(rel.status, 1);
  assert.match(rel.stdout, /\bNOT_APPROVED\b/);
});

test('missing locales dir: dev exits 0, release exits 1 (NO_LOCALES)', () => {
  const dev = runWithArgs(['--locales', 'nonexistent/locales/dir']);
  assert.strictEqual(dev.status, 0);
  assert.match(dev.stdout, /\bNO_LOCALES\b/);

  const rel = runWithArgs(['--locales', 'nonexistent/locales/dir', '--release']);
  assert.strictEqual(rel.status, 1);
  assert.match(rel.stdout, /\bNO_LOCALES\b/);
});

test('empty-locales-dir-bad-registry: dev exits 1, release exits 1 (APPROVAL_INCOMPLETE + NO_EN_LOCALES)', () => {
  const dev = runCheck('empty-locales-dir-bad-registry', false);
  assert.strictEqual(dev.status, 1);
  assert.match(dev.stdout, /\bNO_EN_LOCALES\b/);
  assert.match(dev.stdout, /\bAPPROVAL_INCOMPLETE\b/);

  const rel = runCheck('empty-locales-dir-bad-registry', true);
  assert.strictEqual(rel.status, 1);
  assert.match(rel.stdout, /\bNO_EN_LOCALES\b/);
  assert.match(rel.stdout, /\bAPPROVAL_INCOMPLETE\b/);
});

test('missing-locales-bad-registry: dev exits 1, release exits 1 (APPROVAL_INCOMPLETE + NO_LOCALES)', () => {
  const dev = runCheck('missing-locales-bad-registry', false);
  assert.strictEqual(dev.status, 1);
  assert.match(dev.stdout, /\bNO_LOCALES\b/);
  assert.match(dev.stdout, /\bAPPROVAL_INCOMPLETE\b/);

  const rel = runCheck('missing-locales-bad-registry', true);
  assert.strictEqual(rel.status, 1);
  assert.match(rel.stdout, /\bNO_LOCALES\b/);
  assert.match(rel.stdout, /\bAPPROVAL_INCOMPLETE\b/);
});

test('empty-en-objects: dev exits 0, release exits 1 (NO_EN_KEYS)', () => {
  const dev = runCheck('empty-en-objects', false);
  assert.strictEqual(dev.status, 0);
  assert.match(dev.stdout, /\bNO_EN_KEYS\b/);

  const rel = runCheck('empty-en-objects', true);
  assert.strictEqual(rel.status, 1);
  assert.match(rel.stdout, /\bNO_EN_KEYS\b/);
});

test('empty-en-arrays: dev exits 0, release exits 1 (NO_EN_KEYS)', () => {
  const dev = runCheck('empty-en-arrays', false);
  assert.strictEqual(dev.status, 0);
  assert.match(dev.stdout, /\bNO_EN_KEYS\b/);

  const rel = runCheck('empty-en-arrays', true);
  assert.strictEqual(rel.status, 1);
  assert.match(rel.stdout, /\bNO_EN_KEYS\b/);
});

test('duplicate-locale-key: dev exits 1, release exits 1 (DUPLICATE_LOCALE_KEY naming both files)', () => {
  const dev = runCheck('duplicate-locale-key', false);
  assert.strictEqual(dev.status, 1);
  assert.match(dev.stdout, /\bDUPLICATE_LOCALE_KEY\b/);
  assert.match(dev.stdout, /courses\.en\.json/);
  assert.match(dev.stdout, /en\.json/);

  const rel = runCheck('duplicate-locale-key', true);
  assert.strictEqual(rel.status, 1);
  assert.match(rel.stdout, /\bDUPLICATE_LOCALE_KEY\b/);
  assert.match(rel.stdout, /courses\.en\.json/);
  assert.match(rel.stdout, /en\.json/);
});

test('empty-translation: dev exits 1, release exits 1 (EMPTY_TRANSLATION)', () => {
  const dev = runCheck('empty-translation', false);
  assert.strictEqual(dev.status, 1);
  assert.match(dev.stdout, /\bEMPTY_TRANSLATION\b/);

  const rel = runCheck('empty-translation', true);
  assert.strictEqual(rel.status, 1);
  assert.match(rel.stdout, /\bEMPTY_TRANSLATION\b/);
});

test('whitespace-translation: dev exits 1, release exits 1 (EMPTY_TRANSLATION)', () => {
  const dev = runCheck('whitespace-translation', false);
  assert.strictEqual(dev.status, 1);
  assert.match(dev.stdout, /\bEMPTY_TRANSLATION\b/);

  const rel = runCheck('whitespace-translation', true);
  assert.strictEqual(rel.status, 1);
  assert.match(rel.stdout, /\bEMPTY_TRANSLATION\b/);
});

test('malformed-registry-row: dev exits 1, release exits 1 (MALFORMED_REGISTRY_ROW)', () => {
  const dev = runCheck('malformed-registry-row', false);
  assert.strictEqual(dev.status, 1);
  assert.match(dev.stdout, /\bMALFORMED_REGISTRY_ROW\b/);
  assert.match(dev.stdout, /\(6 cells\)/);
  assert.match(dev.stdout, /\(8 cells\)/);

  const rel = runCheck('malformed-registry-row', true);
  assert.strictEqual(rel.status, 1);
  assert.match(rel.stdout, /\bMALFORMED_REGISTRY_ROW\b/);
  assert.match(rel.stdout, /\(6 cells\)/);
  assert.match(rel.stdout, /\(8 cells\)/);
});

test('escaped-pipe-cell: dev exits 0, release exits 0', () => {
  const dev = runCheck('escaped-pipe-cell', false);
  assert.strictEqual(dev.status, 0);
  assert.match(dev.stdout, /0 errors/);

  const rel = runCheck('escaped-pipe-cell', true);
  assert.strictEqual(rel.status, 0);
  assert.match(rel.stdout, /0 errors/);
});

test('valid-header-separator-only: dev exits 0, release exits 0 (no MALFORMED_REGISTRY_ROW)', () => {
  const dev = runCheck('valid-header-separator-only', false);
  assert.strictEqual(dev.status, 0);
  assert.doesNotMatch(dev.stdout, /\bMALFORMED_REGISTRY_ROW\b/);

  const rel = runCheck('valid-header-separator-only', true);
  assert.strictEqual(rel.status, 0);
  assert.doesNotMatch(rel.stdout, /\bMALFORMED_REGISTRY_ROW\b/);
});
