import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const input = process.argv[2] || "docs/qa/evidence/QA-016/load-results.json";
const output = process.argv[3] || "docs/qa/evidence/QA-016/container-resource-summary.json";
const data = JSON.parse(await readFile(input, "utf8"));

function percentile(values, p) {
  if (!values.length) return null;
  const sorted = values.slice().sort((a, b) => a - b);
  return Number(sorted[Math.max(0, Math.ceil(p * sorted.length) - 1)].toFixed(2));
}

function summarize(records) {
  const ms = records.map((item) => item.durationMs).filter(Number.isFinite);
  return {
    requests: records.length,
    failed: records.filter((item) => !item.passed).length,
    errorRatePct: records.length ? Number((records.filter((item) => !item.passed).length * 100 / records.length).toFixed(2)) : 0,
    latencyMs: {
      p50: percentile(ms, 0.50),
      p95: percentile(ms, 0.95),
      p99: percentile(ms, 0.99),
      max: ms.length ? Number(Math.max(...ms).toFixed(2)) : null,
      mean: ms.length ? Number((ms.reduce((a, b) => a + b, 0) / ms.length).toFixed(2)) : null,
    },
  };
}

function parseBytes(value) {
  const match = String(value || "").match(/([\d.]+)\s*(B|KiB|MiB|GiB|TiB)/i);
  if (!match) return null;
  const factors = { B: 1, KiB: 1024, MiB: 1024 ** 2, GiB: 1024 ** 3, TiB: 1024 ** 4 };
  return Number(match[1]) * factors[match[2]];
}

const groupedRequests = new Map();
for (const item of data.requestSamples || []) {
  let group = item.name;
  if (String(item.name).startsWith("login:qa016.student.")) group = "auth.login.student";
  else if (String(item.name).startsWith("login:")) group = "auth.login.lecturer";
  if (!groupedRequests.has(group)) groupedRequests.set(group, []);
  groupedRequests.get(group).push(item);
}
const endpointMetrics = Object.fromEntries(
  [...groupedRequests.entries()].map(([name, items]) => [name, summarize(items)]),
);

const containers = new Map();
for (const sample of data.dockerResourceSampling?.samples || []) {
  let parsed = sample;
  if (!sample.Name && sample.raw) {
    const match = sample.raw.match(/\{[^{}]*\}/);
    if (!match) continue;
    try { parsed = JSON.parse(match[0]); } catch { continue; }
  }
  if (!parsed.Name) continue;
  if (!containers.has(parsed.Name)) containers.set(parsed.Name, []);
  containers.get(parsed.Name).push({
    sampledAt: sample.sampledAt,
    cpuPct: Number.parseFloat(parsed.CPUPerc),
    memPct: Number.parseFloat(parsed.MemPerc),
    memoryBytes: parseBytes(parsed.MemUsage),
    memoryUsage: parsed.MemUsage,
  });
}

const resourceSummary = {};
for (const [name, samples] of containers) {
  const cpu = samples.map((s) => s.cpuPct).filter(Number.isFinite);
  const memoryPct = samples.map((s) => s.memPct).filter(Number.isFinite);
  const memoryBytes = samples.map((s) => s.memoryBytes).filter(Number.isFinite);
  resourceSummary[name] = {
    samples: samples.length,
    cpuPct: {
      average: cpu.length ? Number((cpu.reduce((a, b) => a + b, 0) / cpu.length).toFixed(2)) : null,
      p95: percentile(cpu, 0.95),
      max: cpu.length ? Number(Math.max(...cpu).toFixed(2)) : null,
    },
    memoryPctMax: memoryPct.length ? Number(Math.max(...memoryPct).toFixed(2)) : null,
    memoryUsageMaxMiB: memoryBytes.length ? Number((Math.max(...memoryBytes) / (1024 ** 2)).toFixed(2)) : null,
  };
}

const statusCounts = {};
for (const probe of data.securityChecks?.results || []) {
  statusCounts[probe.status] = (statusCounts[probe.status] || 0) + 1;
}
const result = {
  generatedAt: new Date().toISOString(),
  source: path.resolve(input),
  endpointMetrics,
  securityStatusCounts: statusCounts,
  containerMetrics: resourceSummary,
};
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(result, null, 2) + "\n", "utf8");
console.log(JSON.stringify(result, null, 2));
