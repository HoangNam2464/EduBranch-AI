/**
 * EduBranch AI — Sprint 2 QA Suite: Security & Authorization for Material Storage (QA-004 / EBA-218).
 *
 * Acceptance Criteria (from docs/03_TASK-DETAILS.md §[28] and docs/06_QA.md):
 *   - QA-004 AC-1: Kiểm thử Lecturer B không thể đọc, tải hoặc xóa tài liệu của Lecturer A.
 *   - QA-004 AC-2: Kiểm thử không thể đoán được URL/key tài liệu trên MinIO.
 *   - QA-004 AC-3: Kiểm thử tính toàn vẹn khi lưu trữ khóa học (C1-B / OPD-014): khóa học rời danh sách
 *     đang hoạt động, tài liệu, chunks pgvector, object MinIO và case được bảo toàn, không nhận tài liệu
 *     hoặc case mới, và không còn API xóa cứng. (AC-3 cũ "xóa khóa học thì tài liệu bị xóa" được PO thay
 *     ngày 2026-11-16 khi chọn C1-B.)
 *
 * Review Findings & Architecture Notes:
 *   - AC-3 needs the course archive API (PATCH /courses/:id/archive, branch feature/course-soft-archive).
 *     Against a backend without it the AC-3 test fails at the archive call (404), by design.
 *   - M2: objectExists rethrows unexpected errors and returns false only on NoSuchKey/NotFound.
 *   - M3: Users are registered once and reused across tests using getOrCreateTestUser.
 *   - M4: Shared fixtures (users A, B, S; course A; fixture PDF material) created in beforeAll;
 *         no test depends on another test having run. Cleanup in afterAll via API then pg.
 *   - L1: Unauthorized upload verification confirms MinIO prefix listing remains identical.
 *
 * Runs against a live stack when QA_LIVE=1.
 */
import * as fs from "fs";
import * as path from "path";
import { Pool } from "pg";
import {
  API,
  DOCX,
  FIXTURES,
  MINIO_BASE,
  PDF,
  BUCKET,
  call,
  cleanupDatabaseEntities,
  createPgPool,
  form,
  getOrCreateTestUser,
  listMinioObjects,
  live,
  objectExists,
  t,
  teardownQaLive,
  TestUser,
} from "./helpers/qa-live";

describe("QA-004 Security & Authorization Tests for Material Storage & Tenant Isolation", () => {
  let userA: TestUser;
  let userB: TestUser;
  let userS: TestUser;
  let courseA: string;
  let fixturePdf: any;
  let pool: Pool;

  const createdMaterialIds: string[] = [];
  const createdCourseIds: string[] = [];
  const createdUserIds: string[] = [];

  beforeAll(async () => {
    if (!live) return;
    const h = await fetch(`${API}/health`);
    if (h.status >= 500) throw new Error(`API ${API}/health -> ${h.status}`);

    pool = createPgPool();

    userA = await getOrCreateTestUser("lecA");
    userB = await getOrCreateTestUser("lecB");
    userS = await getOrCreateTestUser("student");
    createdUserIds.push(userA.id, userB.id, userS.id);

    // Create Course A for Lecturer A
    const cRes = await call("POST", "/courses", userA.token, {
      name: `QA-004 Security Course ${Date.now()}`,
      courseCode: `SEC${Date.now() % 100000}`,
    });
    if (cRes.status !== 201) throw new Error(`create course failed: ${cRes.status} ${cRes.text}`);
    courseA = cRes.body.data.id;
    createdCourseIds.push(courseA);

    // Upload baseline fixture PDF material owned by Lecturer A (M4)
    const fileBytes = fs.readFileSync(path.join(FIXTURES, "sample.pdf"));
    const upRes = await call("POST", `/courses/${courseA}/materials`, userA.token, form("fixture.pdf", fileBytes, PDF));
    if (upRes.status !== 201) throw new Error(`upload fixture failed: ${upRes.status} ${upRes.text}`);
    fixturePdf = upRes.body.data;
    createdMaterialIds.push(fixturePdf.id);
  }, 180000);

  afterAll(async () => {
    if (!live) return;
    for (const id of createdMaterialIds) {
      await call("DELETE", `/materials/${id}`, userA.token).catch(() => undefined);
    }
    if (pool) {
      await pool.end().catch(() => undefined);
    }
    await cleanupDatabaseEntities(createdCourseIds, createdUserIds);
    await teardownQaLive();
  });

  // ---------------------------------------------------------------------------
  // Baseline check
  // ---------------------------------------------------------------------------
  t("extra: FND §6 lecturer A can list and read their own material", async () => {
    const listRes = await call("GET", `/courses/${courseA}/materials`, userA.token);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.map((m: any) => m.id)).toContain(fixturePdf.id);

    const getRes = await call("GET", `/materials/${fixturePdf.id}`, userA.token);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.id).toBe(fixturePdf.id);
  });

  // ---------------------------------------------------------------------------
  // QA-004 AC-1: Kiểm thử Lecturer B không thể đọc, tải hoặc xóa tài liệu của Lecturer A
  // ---------------------------------------------------------------------------
  t("QA-004 AC-1: lecturer B cannot list materials of lecturer A's course; no metadata leaks", async () => {
    const r = await call("GET", `/courses/${courseA}/materials`, userB.token);
    expect(r.status).toBe(403);
    expect(r.text).not.toContain(fixturePdf.original_filename);
    expect(r.text).not.toContain(fixturePdf.stored_object_key);
  });

  t("QA-004 AC-1: lecturer B cannot read A's material by IDOR attempt; no metadata leaks", async () => {
    const r = await call("GET", `/materials/${fixturePdf.id}`, userB.token);
    expect(r.status).toBe(403);
    expect(r.text).not.toContain(fixturePdf.original_filename);
    expect(r.text).not.toContain(fixturePdf.stored_object_key);
  });

  t("QA-004 AC-1: lecturer B cannot rename A's material; data unchanged", async () => {
    const r = await call("PATCH", `/materials/${fixturePdf.id}`, userB.token, { originalFilename: "hacked.pdf" });
    expect(r.status).toBe(403);

    const getRes = await call("GET", `/materials/${fixturePdf.id}`, userA.token);
    expect(getRes.body.data.original_filename).toBe(fixturePdf.original_filename);
  });

  t("QA-004 AC-1: lecturer B cannot delete A's material; row and MinIO object remain intact", async () => {
    const r = await call("DELETE", `/materials/${fixturePdf.id}`, userB.token);
    expect(r.status).toBe(403);

    const getRes = await call("GET", `/materials/${fixturePdf.id}`, userA.token);
    expect(getRes.status).toBe(200);

    const exists = await objectExists(fixturePdf.stored_object_key);
    expect(exists).toBe(true);
  });

  t("QA-004 AC-1: lecturer B cannot upload into A's course; nothing is stored in DB or MinIO", async () => {
    const prefix = `materials/${courseA}`;
    const minioBefore = await listMinioObjects(prefix);
    const listBefore = (await call("GET", `/courses/${courseA}/materials`, userA.token)).body.data.length;

    const r = await call(
      "POST",
      `/courses/${courseA}/materials`,
      userB.token,
      form("intruder.pdf", fs.readFileSync(path.join(FIXTURES, "sample.pdf")), PDF)
    );
    expect(r.status).toBe(403);

    const listAfter = (await call("GET", `/courses/${courseA}/materials`, userA.token)).body.data.length;
    const minioAfter = await listMinioObjects(prefix);

    // L1: Both database rows and MinIO storage remain unchanged
    expect(listAfter).toBe(listBefore);
    expect(minioAfter.length).toBe(minioBefore.length);
  });

  t("QA-004 AC-1: lecturer A (owner) can delete their own material; row and MinIO object are permanently removed", async () => {
    const fileBytes = fs.readFileSync(path.join(FIXTURES, "sample.pdf"));
    const upRes = await call(
      "POST",
      `/courses/${courseA}/materials`,
      userA.token,
      form("to-delete.pdf", fileBytes, PDF)
    );
    expect(upRes.status).toBe(201);
    const tempMat = upRes.body.data;
    expect(tempMat.id).toBeDefined();

    const existsBefore = await objectExists(tempMat.stored_object_key);
    expect(existsBefore).toBe(true);

    const delRes = await call("DELETE", `/materials/${tempMat.id}`, userA.token);
    expect([200, 204]).toContain(delRes.status);

    const getRes = await call("GET", `/materials/${tempMat.id}`, userA.token);
    expect(getRes.status).toBe(404);

    const existsAfter = await objectExists(tempMat.stored_object_key);
    expect(existsAfter).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // Extra role & security checks (FND §6 / Proposal V1.2)
  // ---------------------------------------------------------------------------
  t("extra: FND §6 student role cannot list, read, rename, delete or upload materials", async () => {
    const tok = userS.token;
    expect((await call("GET", `/courses/${courseA}/materials`, tok)).status).toBe(403);
    expect((await call("GET", `/materials/${fixturePdf.id}`, tok)).status).toBe(403);
    expect((await call("PATCH", `/materials/${fixturePdf.id}`, tok, { originalFilename: "x.pdf" })).status).toBe(403);
    expect((await call("DELETE", `/materials/${fixturePdf.id}`, tok)).status).toBe(403);
    expect(
      (await call("POST", `/courses/${courseA}/materials`, tok, form("s.pdf", Buffer.from("%PDF-1.4"), PDF))).status
    ).toBe(403);
  });

  t("extra: FND §6 unauthenticated requests are rejected with 401 and no metadata leak", async () => {
    const listRes = await call("GET", `/courses/${courseA}/materials`);
    expect(listRes.status).toBe(401);

    const getRes = await call("GET", `/materials/${fixturePdf.id}`);
    expect(getRes.status).toBe(401);
    expect(getRes.text).not.toContain(fixturePdf.stored_object_key);
  });

  t("extra: Proposal V1.2 records that a foreign id returns 403 and an unknown id 404 — existence is revealed", async () => {
    const nonExistent = "00000000-0000-4000-8000-000000000000";
    const m = await call("GET", `/materials/${nonExistent}`, userB.token);
    const c = await call("GET", `/courses/${nonExistent}/materials`, userB.token);
    expect(m.status).toBe(404);
    expect(c.status).toBe(404);
  });

  t("extra: Proposal V1.2 no unauthorized download endpoint exposes raw file content", async () => {
    const r = await call("GET", `/materials/${fixturePdf.id}/download`, userB.token);
    expect(r.status).toBe(404);
    expect(r.text).not.toContain("%PDF");
  });

  // ---------------------------------------------------------------------------
  // QA-004 AC-2: Kiểm thử không thể đoán được URL/key tài liệu trên MinIO
  // ---------------------------------------------------------------------------
  t("QA-004 AC-2: stored object keys are unguessable UUIDs and omit original filename and material id", async () => {
    // Expected pattern: materials/<courseId>/<uuid>/<uuid>.<ext>
    const re = /^materials\/[A-Za-z0-9_-]+\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(pdf|docx)$/;
    expect(fixturePdf.stored_object_key).toMatch(re);
    expect(fixturePdf.stored_object_key).not.toContain("fixture.pdf");
    expect(fixturePdf.stored_object_key).not.toContain(fixturePdf.id);
  });

  t("QA-004 AC-2: MinIO objects cannot be read anonymously via real or guessed keys", async () => {
    const realRes = await fetch(`${MINIO_BASE}/${BUCKET}/${fixturePdf.stored_object_key}`);
    expect(realRes.status).toBe(403);

    const guessedRes = await fetch(
      `${MINIO_BASE}/${BUCKET}/materials/${courseA}/${fixturePdf.id}/${fixturePdf.id}.pdf`
    );
    expect([403, 404]).toContain(guessedRes.status);

    const listRes = await fetch(`${MINIO_BASE}/${BUCKET}?list-type=2`);
    expect(listRes.status).toBe(403);
  });

  // ---------------------------------------------------------------------------
  // QA-004 AC-3 (C1-B / OPD-014, PO 2026-11-16): archiving a course keeps all related data safe
  // ---------------------------------------------------------------------------
  t(
    "QA-004 AC-3: archiving a course keeps course, materials, chunks, MinIO objects and cases; the course leaves the active list and accepts no new work",
    async () => {
      // Setup inside the test: course + material + case owned by Lecturer A
      const cRes = await call("POST", "/courses", userA.token, {
        name: `QA-004 Archive Test Course ${Date.now()}`,
      });
      expect(cRes.status).toBe(201);
      const archCourseId: string = cRes.body.data.id;
      expect(archCourseId).toBeDefined();
      createdCourseIds.push(archCourseId);

      const fileBytes = fs.readFileSync(path.join(FIXTURES, "sample.pdf"));
      const upRes = await call("POST", `/courses/${archCourseId}/materials`, userA.token, form("archive.pdf", fileBytes, PDF));
      expect(upRes.status).toBe(201);
      const archMaterial = upRes.body.data;
      expect(archMaterial.id).toBeDefined();
      createdMaterialIds.push(archMaterial.id);

      // A case row in the course (inserted directly: generation needs an LLM key, not under test here)
      const caseIns = await pool.query(
        "INSERT INTO cases (title, course_id, created_by) VALUES ($1, $2, $3) RETURNING id",
        ["QA-004 archive case", archCourseId, userA.id],
      );
      const archCaseId: string = caseIns.rows[0].id;

      // One chunk row inserted directly, so "chunks are kept" is checked against a non-zero count even
      // when no embedding key is configured (real ingestion then ends FAILED with 0 chunks)
      await pool.query(
        `INSERT INTO document_chunks (material_id, course_id, chunk_index, chunk_text, embedding)
         VALUES ($1, $2, 9999, 'QA-004 AC-3 archive probe', array_fill(0::real, ARRAY[768])::vector)`,
        [archMaterial.id, archCourseId],
      );
      const chunksBefore = Number(
        (await pool.query("SELECT COUNT(*) AS n FROM document_chunks WHERE material_id = $1", [archMaterial.id])).rows[0].n,
      );

      expect(chunksBefore).toBeGreaterThanOrEqual(1);

      // Non-owner lecturer and student cannot archive
      expect((await call("PATCH", `/courses/${archCourseId}/archive`, userB.token)).status).toBe(403);
      expect((await call("PATCH", `/courses/${archCourseId}/archive`, userS.token)).status).toBe(403);

      // Owner archives
      const archRes = await call("PATCH", `/courses/${archCourseId}/archive`, userA.token);
      expect(archRes.status).toBe(200);
      expect(archRes.body.data.id).toBe(archCourseId);
      expect(archRes.body.data.is_active).toBe(false);

      // Archiving again is a no-op that still answers 200
      const again = await call("PATCH", `/courses/${archCourseId}/archive`, userA.token);
      expect(again.status).toBe(200);
      expect(again.body.data.is_active).toBe(false);

      // The course leaves the lecturer's active list but stays readable
      const list = await call("GET", "/courses", userA.token);
      expect(list.status).toBe(200);
      expect(list.body.data.map((c: { id: string }) => c.id)).not.toContain(archCourseId);
      expect(list.body.data.map((c: { id: string }) => c.id)).toContain(courseA);
      const one = await call("GET", `/courses/${archCourseId}`, userA.token);
      expect(one.status).toBe(200);
      expect(one.body.data.is_active).toBe(false);

      // Everything related is preserved
      const courseRow = await pool.query("SELECT is_active FROM courses WHERE id = $1", [archCourseId]);
      expect(courseRow.rows).toEqual([{ is_active: false }]);
      const mats = await call("GET", `/courses/${archCourseId}/materials`, userA.token);
      expect(mats.status).toBe(200);
      expect(mats.body.data.map((m: { id: string }) => m.id)).toContain(archMaterial.id);
      expect(await objectExists(archMaterial.stored_object_key)).toBe(true);
      const chunksAfter = Number(
        (await pool.query("SELECT COUNT(*) AS n FROM document_chunks WHERE material_id = $1", [archMaterial.id])).rows[0].n,
      );
      expect(chunksAfter).toBe(chunksBefore);
      const caseRow = await pool.query("SELECT 1 FROM cases WHERE id = $1", [archCaseId]);
      expect(caseRow.rows.length).toBe(1);

      // An archived course accepts no new material and no new case (409), and stores nothing
      const prefix = `materials/${archCourseId}/`;
      const objectsBefore = await listMinioObjects(prefix);
      const up2 = await call("POST", `/courses/${archCourseId}/materials`, userA.token, form("late.pdf", fileBytes, PDF));
      expect(up2.status).toBe(409);
      expect(await listMinioObjects(prefix)).toEqual(objectsBefore);
      const matCount = await pool.query("SELECT COUNT(*) AS n FROM teaching_materials WHERE course_id = $1", [archCourseId]);
      expect(Number(matCount.rows[0].n)).toBe(1);
      const gen = await call("POST", "/cases/generate", userA.token, { courseId: archCourseId, materialIds: [archMaterial.id] });
      expect(gen.status).toBe(409);

      // There is no hard delete any more
      const del = await call("DELETE", `/courses/${archCourseId}`, userA.token);
      expect(del.status).toBe(404);
      expect((await pool.query("SELECT 1 FROM courses WHERE id = $1", [archCourseId])).rows.length).toBe(1);

      // Cleanup of the case row this test inserted. Courses, materials and chunks are cleaned in afterAll
      // (materials through DELETE /materials/:id, which stays allowed in an archived course, then pg)
      await pool.query("DELETE FROM cases WHERE id = $1", [archCaseId]);
    }
  );
});
