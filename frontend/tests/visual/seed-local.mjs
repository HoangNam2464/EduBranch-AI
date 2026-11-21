// Local QA fixtures for Visual QA (LOCAL / DEV DATABASE ONLY — never run against staging or production).
// Creates test accounts and the courses shown in Figma 02.1 through the real API, so screens are
// compared with real data instead of mock arrays. Idempotent: existing accounts/courses/materials are reused.
// Also uploads the CS402 teaching materials of Figma 02.4 (real upload + AI ingestion).
//
// Usage (from frontend/):  node tests/visual/seed-local.mjs
// Needs: backend on VISUAL_API_URL (default http://localhost:8080/api/v1), Postgres container
// "edubranch_postgres" (only to promote the admin test account; the API cannot create admins).
// Writes the generated test credentials to frontend/.env.visual.local (git-ignored via *.local).
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { crc32 } from "node:zlib";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const ENV_FILE = join(here, "../../.env.visual.local");
const API = process.env.VISUAL_API_URL ?? "http://localhost:8080/api/v1";

if (!/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?\//.test(API + "/")) {
  throw new Error(`Refusing to seed a non-local API: ${API}`);
}

const ACCOUNTS = {
  LECTURER: { email: "an.nguyen@duytan.edu.vn", fullName: "TS. Nguyễn Văn An", registerAs: "LECTURER" },
  STUDENT: { email: "minhkhoi@student.duytan.edu.vn", fullName: "Lê Minh Khôi", registerAs: "STUDENT" },
  ADMIN: { email: "admin@duytan.edu.vn", fullName: "Quản trị viên", registerAs: "STUDENT" },
};

// Figma 02.1 course list (name + course code), top to bottom. GET /courses returns newest first, so the
// courses are created bottom-up (OP330 first, CS402 last). Only CS402 has a description in Figma.
const COURSES = [
  { name: "An ninh mạng & Ứng cứu sự cố", courseCode: "CS402", description: "Phân tích các mối đe dọa an ninh mạng, xây dựng phương án ứng cứu và quản trị rủi ro trong hệ thống ngân hàng số." },
  { name: "Kỹ thuật phần mềm & Kiến trúc hệ thống", courseCode: "CS301" },
  { name: "Quản trị hệ thống thông tin", courseCode: "IT305" },
  { name: "Marketing số", courseCode: "MK210" },
  { name: "Quản trị dự án", courseCode: "BA220" },
  { name: "Tài chính doanh nghiệp", courseCode: "FN310" },
  { name: "Hành vi tổ chức", courseCode: "HR205" },
  { name: "Quản trị vận hành", courseCode: "OP330" },
];

function readEnvFile() {
  if (!existsSync(ENV_FILE)) return {};
  return Object.fromEntries(
    readFileSync(ENV_FILE, "utf8").split(/\r?\n/).filter((l) => l && !l.startsWith("#") && l.includes("="))
      .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
  );
}

async function api(path, { method = "GET", token, body } = {}, attempt = 0) {
  const res = await fetch(API + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (res.status === 429 && attempt < 6) {
    const wait = Number(res.headers.get("retry-after")) || 15;
    console.log(`rate limited on ${path}, waiting ${wait}s`);
    await new Promise((r) => setTimeout(r, wait * 1000));
    return api(path, { method, token, body }, attempt + 1);
  }
  return { status: res.status, data: json.data ?? json };
}

async function ensureAccount(role, password) {
  const acc = ACCOUNTS[role];
  const reg = await api("/auth/register", { method: "POST", body: { email: acc.email, password, fullName: acc.fullName, role: acc.registerAs } });
  if (reg.status < 300 && reg.data?.accessToken) return reg.data;
  if (reg.status !== 409) throw new Error(`Register ${role} failed: HTTP ${reg.status} ${JSON.stringify(reg.data).slice(0, 200)}`);
  const login = await api("/auth/login", { method: "POST", body: { email: acc.email, password } });
  if (login.status >= 300) throw new Error(`Login ${role} failed: HTTP ${login.status} (an account with this email may exist with another password)`);
  return login.data;
}

function promoteAdmin(email) {
  const backendEnv = Object.fromEntries(
    readFileSync(join(here, "../../../backend/.env"), "utf8").split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l))
      .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
  );
  execFileSync("docker", [
    "exec", "edubranch_postgres", "psql", "-v", "ON_ERROR_STOP=1",
    "-U", backendEnv.POSTGRES_USER, "-d", backendEnv.POSTGRES_DB,
    "-c", `UPDATE users SET role = 'ADMIN' WHERE email = '${email.replace(/'/g, "''")}'`,
  ], { stdio: ["ignore", "pipe", "inherit"] });
}

const env = readEnvFile();
const creds = {};
for (const role of Object.keys(ACCOUNTS)) {
  creds[role] = { email: ACCOUNTS[role].email, password: env[`VISUAL_${role}_PASSWORD`] ?? `Qa-${randomBytes(9).toString("base64url")}` };
}

writeFileSync(
  ENV_FILE,
  ["# Local Visual QA test accounts (generated by tests/visual/seed-local.mjs). Local dev DB only.",
    `VISUAL_API_URL=${API}`,
    ...Object.entries(creds).flatMap(([role, c]) => [`VISUAL_${role}_EMAIL=${c.email}`, `VISUAL_${role}_PASSWORD=${c.password}`]),
    ""].join("\n"),
);

const lecturer = await ensureAccount("LECTURER", creds.LECTURER.password);
await ensureAccount("STUDENT", creds.STUDENT.password);
await ensureAccount("ADMIN", creds.ADMIN.password);
promoteAdmin(ACCOUNTS.ADMIN.email);

async function listCourses(token) {
  const res = await api("/courses", { token });
  if (res.status >= 300) throw new Error(`List courses failed: HTTP ${res.status}`);
  return Array.isArray(res.data) ? res.data : res.data?.items ?? [];
}

async function countOf(path, token) {
  const res = await api(path, { token });
  if (res.status >= 300) throw new Error(`GET ${path} failed: HTTP ${res.status}`);
  return Array.isArray(res.data) ? res.data.length : 0;
}

const token = lecturer.accessToken;
const codeOf = (c) => c.courseCode ?? c.course_code;
const fixtureCodes = COURSES.map((c) => c.courseCode);
let list = await listCourses(token);
let reordered = false;
const listedOrder = list.map(codeOf).filter((code) => fixtureCodes.includes(code));
if (listedOrder.length === fixtureCodes.length && listedOrder.join() !== fixtureCodes.join()) {
  // An older seed created the fixture courses top-down, so GET /courses lists them reversed.
  // Recreate them bottom-up, but only while none of them holds materials or cases (no QA data lost).
  const fixtures = list.filter((c) => fixtureCodes.includes(codeOf(c)));
  let holdsData = false;
  for (const c of fixtures) {
    if ((await countOf(`/courses/${c.id}/materials`, token)) > 0 || (await countOf(`/courses/${c.id}/cases`, token)) > 0) holdsData = true;
  }
  if (holdsData) {
    console.warn("Fixture courses are not in Figma order but already hold materials/cases; left unchanged.");
  } else {
    for (const c of fixtures) {
      const res = await api(`/courses/${c.id}`, { method: "DELETE", token });
      if (res.status >= 300) throw new Error(`Delete course ${codeOf(c)} failed: HTTP ${res.status}`);
    }
    reordered = true;
    list = await listCourses(token);
  }
}

const haveCodes = new Set(list.map(codeOf));
let created = 0;
for (const course of [...COURSES].reverse()) {
  if (haveCodes.has(course.courseCode)) continue;
  const res = await api("/courses", { method: "POST", token, body: course });
  if (res.status >= 300) throw new Error(`Create course ${course.courseCode} failed: HTTP ${res.status} ${JSON.stringify(res.data).slice(0, 200)}`);
  created++;
}

// ── CS402 teaching materials (Figma 02.4 / 02.7) ──────────────────────────────
// Real upload through POST /courses/:id/materials. The backend runs AI ingestion synchronously:
// a row ends COMPLETED when the AI service can embed the text, FAILED otherwise (e.g. no
// embedding key configured). GET lists newest first, so the Figma list is uploaded bottom-up.
const MATERIALS = [
  { name: "Runbook_ung_cuu_su_co_DDoS.pdf", text: "Runbook ung cuu su co DDoS: kich hoat che do ha cap, gioi han toc do Token Bucket tai Gateway, thong bao bo phan cham soc khach hang trong 10 phut." },
  { name: "Slide_Tuan_7_An_ninh_mang.pdf", text: "Slide tuan 7 An ninh mang: mo hinh de doa, phan tich rui ro va quy trinh ung cuu su co trong ngan hang so." },
  { name: "Bao_cao_su_co_ngan_hang.docx", text: "Bao cao su co ngan hang: moc thoi gian tung quyet dinh, nguoi phe duyet va chi so SLA truoc, trong va sau can thiep." },
  { name: "Giao_trinh_Zero_Trust_Security.pdf", text: "Giao trinh Zero Trust Security: xac thuc lien tuc, phan doan mang va nguyen tac dac quyen toi thieu." },
  { name: "Phu_luc_Nhat_ky_he_thong.docx", text: "Phu luc nhat ky he thong: mau nhat ky truy cap, canh bao bat thuong va chinh sach luu tru nhat ky." },
];

/** One-page PDF with a single line of Helvetica text (ASCII only). */
function makePdf(text) {
  const escaped = text.replace(/[\\()]/g, (m) => `\\${m}`);
  const stream = `BT /F1 12 Tf 50 780 Td (${escaped}) Tj ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = objects.map((body, i) => {
    const at = pdf.length;
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
    return at;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, "latin1");
}

/** Minimal DOCX: an uncompressed ZIP holding the three parts Word needs. */
function makeDocx(text) {
  const body = text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const parts = [
    ["[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'],
    ["_rels/.rels", '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'],
    ["word/document.xml", `<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>${body}</w:t></w:r></w:p></w:body></w:document>`],
  ];
  const chunks = [];
  const central = [];
  let offset = 0;
  for (const [name, content] of parts) {
    const nameBuf = Buffer.from(name, "utf8");
    const data = Buffer.from(content, "utf8");
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    const entry = Buffer.alloc(46);
    entry.writeUInt32LE(0x02014b50, 0);
    entry.writeUInt16LE(20, 4);
    entry.writeUInt16LE(20, 6);
    entry.writeUInt32LE(crc, 16);
    entry.writeUInt32LE(data.length, 20);
    entry.writeUInt32LE(data.length, 24);
    entry.writeUInt16LE(nameBuf.length, 28);
    entry.writeUInt32LE(offset, 42);
    chunks.push(local, nameBuf, data);
    central.push(entry, nameBuf);
    offset += 30 + nameBuf.length + data.length;
  }
  const centralBuf = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(parts.length, 8);
  end.writeUInt16LE(parts.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...chunks, centralBuf, end]);
}

const cs402 = (await listCourses(token)).find((c) => codeOf(c) === "CS402");
const materialStatuses = {};
if (cs402 && (await countOf(`/courses/${cs402.id}/materials`, token)) === 0) {
  for (const m of [...MATERIALS].reverse()) {
    const isPdf = m.name.endsWith(".pdf");
    const type = isPdf ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    const form = new FormData();
    form.append("file", new Blob([isPdf ? makePdf(m.text) : makeDocx(m.text)], { type }), m.name);
    const res = await fetch(`${API}/courses/${cs402.id}/materials`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
    const json = await res.json().catch(() => ({}));
    if (res.status >= 300) throw new Error(`Upload ${m.name} failed: HTTP ${res.status} ${JSON.stringify(json).slice(0, 200)}`);
    materialStatuses[m.name] = json.data?.processing_status;
  }
}

console.log(JSON.stringify({ accounts: Object.keys(creds), coursesReordered: reordered, coursesCreated: created, materialsUploaded: materialStatuses, envFile: ".env.visual.local" }));
