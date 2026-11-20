// Visual QA fixtures for Lecturer Feedback / Statistics / Student Review Feedback (PR #68, #69, #70).
// LOCAL DOCKER POSTGRES ONLY. PO approval 2026-11-21 (conditional): local Docker DB only, fixture or
// anonymised data only, idempotent, explicit target, never delete data outside the seed scope.
//
// Usage (from frontend/, after `node tests/visual/seed-local.mjs`):
//   node tests/visual/seed-feedback-stats.mjs            # seed + verify
//   node tests/visual/seed-feedback-stats.mjs --verify   # verify only
// Target: container "edubranch_postgres", database and user from backend/.env (must be a local host).
// Runs seed-feedback-stats.sql in one transaction (psql -1). All rows have fixed ids (5eed0003-…) and are
// inserted with ON CONFLICT DO NOTHING; nothing outside that range is deleted or updated.
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const CONTAINER = "edubranch_postgres";
const backendDir = join(here, "../../../backend");
const env = Object.fromEntries(
  readFileSync(join(backendDir, ".env"), "utf8").split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()]),
);
if (!/^(localhost|127\.0\.0\.1|::1|postgres)$/.test(env.POSTGRES_HOST ?? "localhost")) {
  throw new Error(`Refusing to seed: backend/.env POSTGRES_HOST=${env.POSTGRES_HOST} is not local`);
}
const DB = env.POSTGRES_DB;
const USER = env.POSTGRES_USER;
if (!DB || !USER) throw new Error("backend/.env must define POSTGRES_DB and POSTGRES_USER");

const running = execFileSync("docker", ["ps", "--filter", `name=^${CONTAINER}$`, "--format", "{{.Names}}"], { encoding: "utf8" }).trim();
if (running !== CONTAINER) throw new Error(`Docker container ${CONTAINER} is not running`);

const psql = (args, input) =>
  execFileSync("docker", ["exec", "-i", CONTAINER, "psql", "-v", "ON_ERROR_STOP=1", "-U", USER, "-d", DB, ...args], {
    encoding: "utf8", input,
  });

console.log(`target: docker ${CONTAINER} / database ${DB} / user ${USER}`);

if (!process.argv.includes("--verify")) {
  // Hash of a random secret that is never stored or printed: fixture students cannot sign in.
  const bcrypt = createRequire(join(backendDir, "package.json"))("bcrypt");
  const fixtureHash = bcrypt.hashSync(randomBytes(32).toString("hex"), 10);
  const sql = readFileSync(join(here, "seed-feedback-stats.sql"), "utf8");
  psql(["-1", "-q", "-v", `fixture_hash=${fixtureHash}`], sql);
  console.log("seed applied");
}

// Verification: counts in the seed range and link checks (each must print the expected value).
const checks = [
  ["fixture students", "SELECT count(*) FROM users WHERE id::text LIKE '5eed0003-%' AND role = 'STUDENT'", "8"],
  ["CS402 enrolments of seeded students", `SELECT count(*) FROM course_enrollments e JOIN courses c ON c.id = e.course_id
     WHERE c.course_code = 'CS402' AND (e.student_id::text LIKE '5eed0003-%' OR e.student_id = (SELECT id FROM users WHERE email = 'minhkhoi@student.duytan.edu.vn'))`, "9"],
  ["published seeded cases in CS402 of an.nguyen", `SELECT count(*) FROM cases c JOIN courses co ON co.id = c.course_id JOIN users u ON u.id = co.lecturer_id
     WHERE c.id::text LIKE '5eed0003-%' AND c.status = 'PUBLISHED' AND co.course_code = 'CS402' AND u.email = 'an.nguyen@duytan.edu.vn'`, "2"],
  ["root node set and belongs to the case", `SELECT count(*) FROM cases c JOIN case_nodes n ON n.id = c.root_node_id AND n.case_id = c.id
     WHERE c.id = '5eed0003-0000-4000-8000-000000000201' AND n.node_index = 0`, "1"],
  ["options of non-terminal nodes pointing outside the case (FND §5)", `SELECT count(*) FROM case_options o JOIN case_nodes n ON n.id = o.node_id
     LEFT JOIN case_nodes t ON t.id = o.next_node_id AND t.case_id = n.case_id
     WHERE n.case_id = '5eed0003-0000-4000-8000-000000000201' AND (t.id IS NULL OR n.is_terminal)`, "0"],
  ["terminal nodes with options", `SELECT count(*) FROM case_nodes n JOIN case_options o ON o.node_id = n.id
     WHERE n.case_id = '5eed0003-0000-4000-8000-000000000201' AND n.is_terminal`, "0"],
  ["completed attempts ending on a terminal node", `SELECT count(*) FROM branching_attempts a JOIN case_nodes n ON n.id = a.outcome_node_id
     WHERE a.id::text LIKE '5eed0003-%' AND a.is_completed AND n.is_terminal`, "7"],
  ["reasoning rows whose option belongs to their node", `SELECT count(*) FROM student_reasoning r JOIN case_options o ON o.id = r.selected_option_id AND o.node_id = r.node_id
     WHERE r.id::text LIKE '5eed0003-%'`, "15"],
  ["review submissions SUBMITTED/REVIEWED/REFLECTED", `SELECT string_agg(submission_status || '=' || n, ',' ORDER BY submission_status)
     FROM (SELECT submission_status, count(*) n FROM review_study_submissions WHERE id::text LIKE '5eed0003-%' GROUP BY 1) s`, "REFLECTED=1,REVIEWED=1,SUBMITTED=2"],
  ["minhkhoi has a REVIEWED submission with feedback", `SELECT count(*) FROM review_study_submissions s JOIN lecturer_feedback f ON f.review_submission_id = s.id
     WHERE s.student_id = (SELECT id FROM users WHERE email = 'minhkhoi@student.duytan.edu.vn') AND s.submission_status = 'REVIEWED'`, "1"],
  ["feedback rows by the CS402 owner, one target each", `SELECT count(*) FROM lecturer_feedback f JOIN users u ON u.id = f.lecturer_id
     WHERE f.id::text LIKE '5eed0003-%' AND u.email = 'an.nguyen@duytan.edu.vn'
       AND ((f.branching_attempt_id IS NULL) <> (f.review_submission_id IS NULL))`, "4"],
];
let failed = 0;
for (const [name, sql, expected] of checks) {
  const got = psql(["-At", "-c", sql.replace(/\s+/g, " ")]).trim();
  const ok = got === expected;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}: ${got}${ok ? "" : ` (expected ${expected})`}`);
}
if (failed) {
  console.error(`${failed} check(s) failed`);
  process.exit(1);
}
console.log("all checks passed");
