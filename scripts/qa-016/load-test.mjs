import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { performance } from "node:perf_hooks";
import path from "node:path";

const apiBase = (process.env.QA016_API_BASE_URL || "http://localhost:8080/api/v1").replace(/\/$/, "");
const outputPath = process.env.QA016_OUTPUT || path.resolve("docs/qa/evidence/QA-016/load-results.json");
const password = process.env.QA016_TEST_PASSWORD || "Demo@123456";
const courseId = "20000000-0000-4000-8000-000000000001";
const branchingCaseId = "30000000-0000-4000-8000-000000000001";
const draftCaseId = "30000000-0000-4000-8000-000000000003";
const rootNodeId = "40000000-0000-4000-8000-000000000001";
const decisionNodeId = "40000000-0000-4000-8000-000000000002";
const rootOptionId = "50000000-0000-4000-8000-000000000001";
const terminalOptionId = "50000000-0000-4000-8000-000000000003";
const lecturerEmail = "lecturer.demo@edubranch.test";
const foreignLecturerEmail = "qa016.lecturer.foreign@load.edubranch.test";
const requests = [];
const tokenCache = new Map();
const securityResults = [];
const stageResults = [];
const failures = [];
const resourceSamples = [];
let resourceSamplingError = null;

function startDockerStatsSampler() {
  let buffer = "";
  let stderr = "";
  let stopped = false;
  let child;
  try {
    child = spawn("docker", ["stats", "--format", "{{json .}}"], { windowsHide: true });
  } catch (error) {
    resourceSamplingError = String(error && error.message ? error.message : error);
    return { stop: async () => {} };
  }
  child.stdout.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const jsonText = line.match(/\{[^{}]*\}/);
        if (!jsonText) throw new Error("No JSON object in docker stats output");
        resourceSamples.push({ sampledAt: new Date().toISOString(), ...JSON.parse(jsonText[0]) });
      } catch {
        resourceSamples.push({ sampledAt: new Date().toISOString(), raw: line });
      }
    }
  });
  child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
  child.on("error", (error) => {
    resourceSamplingError = String(error && error.message ? error.message : error);
  });
  child.on("exit", (code) => {
    if (!stopped && code !== 0) resourceSamplingError = stderr.trim() || ("docker stats exited with code " + code);
  });
  return {
    stop: async () => {
      if (stopped) return;
      stopped = true;
      if (buffer.trim()) {
        try {
          const jsonText = buffer.match(/\{[^{}]*\}/);
          if (!jsonText) throw new Error("No JSON object in docker stats output");
          resourceSamples.push({ sampledAt: new Date().toISOString(), ...JSON.parse(jsonText[0]) });
        } catch {
          resourceSamples.push({ sampledAt: new Date().toISOString(), raw: buffer });
        }
      }
      await new Promise((resolve) => {
        const timeout = setTimeout(resolve, 1500);
        child.once("exit", () => { clearTimeout(timeout); resolve(); });
        child.kill();
      });
      if (!resourceSamples.length && stderr.trim()) resourceSamplingError = stderr.trim();
    },
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function userEmail(index) {
  return "qa016.student." + String(index).padStart(2, "0") + "@load.edubranch.test";
}

async function request(stage, name, method, url, options = {}) {
  const token = options.token;
  const body = options.body;
  const expected = options.expected || [200];
  const category = options.category || "functional";
  const started = performance.now();
  let response;
  let text = "";
  try {
    response = await fetch(apiBase + url, {
      method,
      headers: {
        ...(token ? { authorization: "Bearer " + token } : {}),
        ...(body !== undefined ? { "content-type": "application/json" } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    text = await response.text();
  } catch (error) {
    const record = {
      stage, name, method, url, category, status: null,
      durationMs: Number((performance.now() - started).toFixed(2)),
      passed: false, error: String(error && error.message ? error.message : error),
    };
    requests.push(record);
    if (category === "security") securityResults.push(record);
    throw new Error(name + ": " + record.error);
  }

  let parsed = null;
  try { parsed = JSON.parse(text); } catch { /* preserve non-JSON response as status evidence only */ }
  const passed = expected.includes(response.status);
  const record = {
    stage, name, method, url, category, status: response.status,
    durationMs: Number((performance.now() - started).toFixed(2)),
    passed,
    ...(passed ? {} : { error: text.slice(0, 400) }),
  };
  requests.push(record);
  if (category === "security") securityResults.push(record);
  if (!passed) throw new Error(name + ": expected " + expected.join("/") + " but got " + response.status);
  return { status: response.status, body: parsed, text };
}

async function login(stage, email, category = "functional") {
  if (tokenCache.has(email)) return tokenCache.get(email);
  const result = await request(stage, "login:" + email, "POST", "/auth/login", {
    body: { email, password }, expected: [200], category,
  });
  const token = result.body && result.body.data && result.body.data.accessToken;
  if (!token) throw new Error("Login succeeded without accessToken for " + email);
  tokenCache.set(email, token);
  return token;
}

async function studentFlow(stage, index, runSecurityChecks) {
  const token = await login(stage, userEmail(index));
  const caseList = await request(stage, "student.list-course-cases", "GET", "/courses/" + courseId + "/cases", { token });
  const listedCases = caseList.body && caseList.body.data;
  if (!Array.isArray(listedCases) || !listedCases.some((item) => item.id === branchingCaseId)) {
    throw new Error("Student " + index + ": published Branching Study case missing from course list");
  }
  if (listedCases.some((item) => item.id === draftCaseId)) {
    throw new Error("Student " + index + ": unpublished case leaked in course list");
  }

  const detail = await request(stage, "student.read-published-case", "GET", "/cases/" + branchingCaseId, { token });
  const detailJson = JSON.stringify(detail.body || {});
  if (/"nodes"\s*:|"options"\s*:|"consequence"\s*:|"next_node_id"\s*:/i.test(detailJson)) {
    throw new Error("Student " + index + ": case detail exposed decision-tree internals");
  }

  const started = await request(stage, "student.start-attempt", "POST", "/cases/" + branchingCaseId + "/branching-attempts", {
    token, expected: [201],
  });
  const attemptId = started.body && started.body.data && started.body.data.id;
  if (!attemptId) throw new Error("Student " + index + ": attempt response has no id");

  await request(stage, "student.choose-root-option", "POST", "/branching-attempts/" + attemptId + "/step", {
    token, body: { nodeId: rootNodeId, selectedOptionId: rootOptionId }, expected: [201],
  });
  await request(stage, "student.choose-terminal-option", "POST", "/branching-attempts/" + attemptId + "/step", {
    token, body: { nodeId: decisionNodeId, selectedOptionId: terminalOptionId }, expected: [201],
  });

  const review = await request(stage, "student.read-completed-journey-review", "GET",
    "/cases/" + branchingCaseId + "/branching-attempts/" + attemptId + "/review", { token });
  if (!review.body || !review.body.data || !Array.isArray(review.body.data.path) || review.body.data.path.length !== 2) {
    throw new Error("Student " + index + ": Journey Review returned an unexpected path");
  }

  if (runSecurityChecks) {
    await request(stage, "security.student-cannot-list-lecturer-courses", "GET", "/courses", {
      token, expected: [403], category: "security",
    });
    await request(stage, "security.student-cannot-read-draft-case", "GET", "/cases/" + draftCaseId, {
      token, expected: [403], category: "security",
    });
    await request(stage, "security.missing-token-rejected", "GET", "/cases/" + branchingCaseId, {
      expected: [401], category: "security",
    });
    await request(stage, "security.student-cannot-generate-case", "POST", "/cases/generate", {
      token, body: { courseId, materialIds: [] }, expected: [403], category: "security",
    });
  }
}

async function lecturerFlow(stage, token) {
  const courses = await request(stage, "lecturer.list-own-courses", "GET", "/courses", { token });
  if (!courses.body || !courses.body.data || !courses.body.data.some((item) => item.id === courseId)) {
    throw new Error("Lecturer cannot see the owned demo course");
  }
  await request(stage, "lecturer.list-own-course-cases", "GET", "/courses/" + courseId + "/cases", { token });
  await request(stage, "lecturer.read-own-case", "GET", "/cases/" + branchingCaseId, { token });
}

function percentile(values, p) {
  if (!values.length) return null;
  const sorted = values.slice().sort((a, b) => a - b);
  return Number(sorted[Math.max(0, Math.ceil(p * sorted.length) - 1)].toFixed(2));
}

function summarize(records) {
  const durations = records.map((item) => item.durationMs).filter(Number.isFinite);
  const failedCount = records.filter((item) => !item.passed).length;
  return {
    requests: records.length,
    failedRequests: failedCount,
    errorRatePct: records.length ? Number((failedCount * 100 / records.length).toFixed(2)) : 0,
    latencyMs: {
      min: durations.length ? Number(Math.min(...durations).toFixed(2)) : null,
      p50: percentile(durations, 0.50),
      p95: percentile(durations, 0.95),
      p99: percentile(durations, 0.99),
      max: durations.length ? Number(Math.max(...durations).toFixed(2)) : null,
      mean: durations.length ? Number((durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2)) : null,
    },
  };
}

async function main() {
  const dockerStats = startDockerStatsSampler();
  const lecturerToken = await login("setup", lecturerEmail);
  const foreignLecturerToken = await login("setup", foreignLecturerEmail);
  const concurrencyLevels = [1, 10, 25, 50];

  for (const concurrency of concurrencyLevels) {
    const stage = "vu-" + concurrency;
    const before = requests.length;
    const startedAtIso = new Date().toISOString();
    const startedAt = performance.now();
    const tasks = [];
    for (let index = 1; index <= concurrency; index += 1) {
      tasks.push(studentFlow(stage, index, concurrency === 50 && index % 10 === 0));
    }
    const lecturerSessions = Math.min(5, Math.max(1, Math.ceil(concurrency / 10)));
    for (let index = 0; index < lecturerSessions; index += 1) tasks.push(lecturerFlow(stage, lecturerToken));
    if (concurrency === 50) {
      tasks.push(
        request(stage, "security.foreign-lecturer-case-denied", "GET", "/cases/" + branchingCaseId, {
          token: foreignLecturerToken, expected: [403], category: "security",
        }),
        request(stage, "security.foreign-lecturer-course-cases-denied", "GET", "/courses/" + courseId + "/cases", {
          token: foreignLecturerToken, expected: [403], category: "security",
        }),
      );
    }
    const outcomes = await Promise.allSettled(tasks);
    for (const outcome of outcomes) {
      if (outcome.status === "rejected") failures.push({ stage, error: String(outcome.reason && outcome.reason.message ? outcome.reason.message : outcome.reason) });
    }
    const durationMs = Number((performance.now() - startedAt).toFixed(2));
    const stageRequests = requests.slice(before);
    stageResults.push({
      concurrency, start: startedAtIso, durationMs, requests: stageRequests.length,
      successfulFlowRequests: summarize(stageRequests.filter((item) => item.category === "functional")),
      expectedSecurityChecks: summarize(stageRequests.filter((item) => item.category === "security")),
      throughputRequestsPerSecond: Number((stageRequests.length * 1000 / durationMs).toFixed(2)),
      failedVirtualUsers: outcomes.filter((outcome) => outcome.status === "rejected").length,
    });
  }

  const soakSeconds = Math.max(1, Number(process.env.QA016_SOAK_SECONDS || 60));
  const soakStage = "vu-50-soak";
  const soakRequestStart = requests.length;
  const soakStartedAt = new Date().toISOString();
  const soakStartedClock = Date.now();
  const soakEnd = soakStartedClock + soakSeconds * 1000;
  const soakCounters = { completedStudentFlows: 0, lecturerReadCycles: 0 };
  const soakTasks = [];
  for (let index = 1; index <= 50; index += 1) {
    soakTasks.push((async () => {
      while (Date.now() < soakEnd) {
        try {
          await studentFlow(soakStage, index, false);
          soakCounters.completedStudentFlows += 1;
          await sleep(1000);
        } catch (error) {
          failures.push({
            stage: soakStage,
            error: String(error && error.message ? error.message : error),
          });
          break;
        }
      }
    })());
  }
  for (let index = 0; index < 5; index += 1) {
    soakTasks.push((async () => {
      while (Date.now() < soakEnd) {
        try {
          await lecturerFlow(soakStage, lecturerToken);
          soakCounters.lecturerReadCycles += 1;
          await sleep(2000);
        } catch (error) {
          failures.push({
            stage: soakStage,
            error: String(error && error.message ? error.message : error),
          });
          break;
        }
      }
    })());
  }
  const soakOutcomes = await Promise.allSettled(soakTasks);
  const soakDurationMs = Date.now() - soakStartedClock;
  const soakRecords = requests.slice(soakRequestStart);
  stageResults.push({
    concurrency: 50,
    stage: soakStage,
    start: soakStartedAt,
    durationMs: soakDurationMs,
    requests: soakRecords.length,
    successfulFlowRequests: summarize(soakRecords.filter((item) => item.category === "functional")),
    expectedSecurityChecks: summarize(soakRecords.filter((item) => item.category === "security")),
    throughputRequestsPerSecond: Number((soakRecords.length * 1000 / soakDurationMs).toFixed(2)),
    failedVirtualUsers: soakOutcomes.filter((outcome) => outcome.status === "rejected").length,
    ...soakCounters,
  });
  await dockerStats.stop();

  const functional = requests.filter((item) => item.category === "functional");
  const grouped = new Map();
  for (const item of functional) {
    if (!grouped.has(item.name)) grouped.set(item.name, []);
    grouped.get(item.name).push(item);
  }
  const endpointMetrics = {};
  for (const [name, records] of grouped.entries()) endpointMetrics[name] = summarize(records);

  const result = {
    task: "QA-016 / EBA-432",
    generatedAt: new Date().toISOString(),
    apiBase,
    configuration: {
      plannedConcurrency: concurrencyLevels,
      maxStudentVirtualUsers: 50,
      testPassword: "[redacted]",
      phases: ["login", "published case read", "attempt initialization", "two option selections", "Journey Review"],
      steadyStateSeconds: soakSeconds,
      lecturerReadSessionsDuringSteadyState: 5,
      aiCalls: "None in this load profile",
    },
    stages: stageResults,
    functionalOverall: summarize(functional),
    securityChecks: {
      checks: securityResults.length,
      passed: securityResults.filter((item) => item.passed).length,
      failed: securityResults.filter((item) => !item.passed).length,
      results: securityResults.map(({ stage, name, status, durationMs, passed }) => ({ stage, name, status, durationMs, passed })),
    },
    endpointMetrics,
    dockerResourceSampling: {
      sampleCount: resourceSamples.length,
      samplingError: resourceSamplingError,
      samples: resourceSamples,
    },
    virtualUserFailures: failures,
    requestSamples: requests,
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(result, null, 2) + "\n", "utf8");
  console.log(JSON.stringify({
    outputPath,
    stages: stageResults,
    functionalOverall: result.functionalOverall,
    securityChecks: result.securityChecks,
    virtualUserFailures: failures,
    dockerResourceSampleCount: resourceSamples.length,
    dockerResourceSamplingError: resourceSamplingError,
  }, null, 2));
  if (failures.length || result.securityChecks.failed || result.functionalOverall.failedRequests) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
