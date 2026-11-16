/**
 * EduBranch AI — Sprint 2 QA Suite: Material Upload Validation (QA-003 / EBA-217).
 *
 * Acceptance Criteria (from docs/03_TASK-DETAILS.md §[27] and docs/06_QA.md):
 *   - QA-003 AC-1: Kiểm thử thành công upload file PDF và DOCX hợp lệ.
 *   - QA-003 AC-2: Kiểm thử từ chối các file sai MIME type, file dung lượng >50MB.
 *   - QA-003 AC-3: Kiểm thử xử lý lỗi mạng và hiển thị trạng thái retry.
 *
 * Review Findings & Architecture Notes:
 *   - Contract note: The backend API returns size_bytes as a string (Postgres BIGINT serialized via pg).
 *   - QA_EMBEDDINGS=1: Set when a real embedding key is configured; otherwise the FND §6 failure test expects FAILED.
 *   - H1: Upload assertions verify only upload ownership (HTTP 201, stored metadata,
 *         MinIO object presence). Ingestion outcome is deferred to QA-005.
 *   - H3: AC-3 backend half verifies that an AI service outage does not crash upload
 *         (defined HTTP 201 result, material transitions to FAILED with non-empty error).
 *         Runs when QA_AI_DOWN=1 (operator stops ai-service container), skipped otherwise.
 *         UI-half note: QA-003 UI test UI-5 FAILED on develop (FE-003 defect, owner Hướng);
 *         frontend retry UI is not tested in this backend suite.
 *   - L1: Rejection tests verify that nothing is stored both in the database and under
 *         the MinIO storage prefix before/after the attempt.
 *   - L2: Validates non-empty preconditions before status assertions on returned lists.
 *   - M3: Uses shared in-process user caching with 429 Retry-After handling.
 *   - M4: Shared fixtures created in beforeAll; API material cleanup followed by direct
 *         PostgreSQL cleanup in afterAll.
 *
 * Runs against a live stack when QA_LIVE=1.
 */
import * as fs from "fs";
import * as path from "path";
import {
  API,
  AI_SERVICE_BASE_URL,
  DOCX,
  FIXTURES,
  MB,
  PDF,
  call,
  cleanupDatabaseEntities,
  form,
  getOrCreateTestUser,
  listMinioObjects,
  live,
  objectExists,
  t,
  teardownQaLive,
  TestUser,
} from "./helpers/qa-live";

describe("QA-003 Material Upload Validation, File Types & Size Bounds", () => {
  let userA: TestUser;
  let courseA: string;
  const createdMaterialIds: string[] = [];
  const createdCourseIds: string[] = [];
  const createdUserIds: string[] = [];

  beforeAll(async () => {
    if (!live) return;
    const h = await fetch(`${API}/health`);
    if (h.status >= 500) throw new Error(`API ${API}/health -> ${h.status}`);

    userA = await getOrCreateTestUser("lecA");
    createdUserIds.push(userA.id);

    const c = await call("POST", "/courses", userA.token, {
      name: `QA-003 Course ${Date.now()}`,
      courseCode: `UPL${Date.now() % 100000}`,
    });
    if (c.status !== 201) throw new Error(`Failed to create test course: ${c.status} ${c.text}`);
    courseA = c.body.data.id;
    createdCourseIds.push(courseA);
  }, 180000);

  afterAll(async () => {
    if (!live) return;
    for (const id of createdMaterialIds) {
      await call("DELETE", `/materials/${id}`, userA.token).catch(() => undefined);
    }
    await cleanupDatabaseEntities(createdCourseIds, createdUserIds);
    await teardownQaLive();
  });

  // ---------------------------------------------------------------------------
  // QA-003 AC-1: Kiểm thử thành công upload file PDF và DOCX hợp lệ
  // ---------------------------------------------------------------------------
  t("QA-003 AC-1: valid PDF upload is accepted, stored in MinIO with matching metadata", async () => {
    const fileBytes = fs.readFileSync(path.join(FIXTURES, "sample.pdf"));
    const r = await call("POST", `/courses/${courseA}/materials`, userA.token, form("qa-sample.pdf", fileBytes, PDF));

    expect(r.status).toBe(201);
    const mat = r.body.data;
    expect(mat?.id).toBeDefined();
    createdMaterialIds.push(mat.id);

    // H1: Assert upload ownership (HTTP 201, metadata, MinIO storage)
    expect(mat.original_filename).toBe("qa-sample.pdf");
    expect(mat.mime_type).toBe(PDF);
    expect(Number(mat.size_bytes)).toBe(fileBytes.length);
    expect(mat.course_id).toBe(courseA);
    expect(mat.stored_object_key).toBeDefined();

    const exists = await objectExists(mat.stored_object_key);
    expect(exists).toBe(true);
  });

  t("QA-003 AC-1: valid DOCX upload is accepted, stored in MinIO with matching metadata", async () => {
    const fileBytes = fs.readFileSync(path.join(FIXTURES, "sample.docx"));
    const r = await call("POST", `/courses/${courseA}/materials`, userA.token, form("qa-sample.docx", fileBytes, DOCX));

    expect(r.status).toBe(201);
    const mat = r.body.data;
    expect(mat?.id).toBeDefined();
    createdMaterialIds.push(mat.id);

    // H1: Assert upload ownership
    expect(mat.original_filename).toBe("qa-sample.docx");
    expect(mat.mime_type).toBe(DOCX);
    expect(Number(mat.size_bytes)).toBe(fileBytes.length);
    expect(mat.course_id).toBe(courseA);
    expect(mat.stored_object_key).toBeDefined();

    const exists = await objectExists(mat.stored_object_key);
    expect(exists).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // QA-003 AC-2: Kiểm thử từ chối các file sai MIME type, file dung lượng >50MB
  // ---------------------------------------------------------------------------
  t("QA-003 AC-2: unsupported MIME types are rejected with 400 and nothing is stored", async () => {
    const prefix = `materials/${courseA}`;
    const minioBefore = await listMinioObjects(prefix);
    const listBefore = (await call("GET", `/courses/${courseA}/materials`, userA.token)).body.data.length;

    const testCases = [
      ["list.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
      ["notes.txt", "text/plain"],
      ["run.exe", "application/x-msdownload"],
      ["img.png", "image/png"],
    ];

    for (const [name, type] of testCases) {
      const r = await call(
        "POST",
        `/courses/${courseA}/materials`,
        userA.token,
        form(name, Buffer.from("unsupported file content"), type)
      );
      expect(r.status).toBe(400);
      expect(r.text).toMatch(/Unsupported file type/);
    }

    const listAfter = (await call("GET", `/courses/${courseA}/materials`, userA.token)).body.data.length;
    const minioAfter = await listMinioObjects(prefix);

    // L1: Both database rows and MinIO storage remain unchanged
    expect(listAfter).toBe(listBefore);
    expect(minioAfter.length).toBe(minioBefore.length);
  });

  t("QA-003 AC-2: spoofed MIME type (executable declared as application/pdf) never reaches COMPLETED", async () => {
    const r = await call(
      "POST",
      `/courses/${courseA}/materials`,
      userA.token,
      form("spoofed.pdf", Buffer.from("MZ\x90\x00 fake binary executable header not pdf"), PDF)
    );

    if (r.status === 201) {
      createdMaterialIds.push(r.body.data.id);
      expect(r.body.data.processing_status).toBe("FAILED");
      expect(r.body.data.chunk_count ?? 0).toBe(0);
      expect(r.body.data.processing_error).toMatch(/\(422\)|Corrupted or invalid/i);
    } else {
      expect(r.status).toBe(400);
    }
  });

  t("QA-003 AC-2: file exceeding 50 MB bound is rejected with 400 and nothing is stored", async () => {
    const prefix = `materials/${courseA}`;
    const minioBefore = await listMinioObjects(prefix);
    const listBefore = (await call("GET", `/courses/${courseA}/materials`, userA.token)).body.data.length;

    const r = await call(
      "POST",
      `/courses/${courseA}/materials`,
      userA.token,
      form("oversized.pdf", Buffer.alloc(50 * MB + 1, 0x20), PDF)
    );

    expect(r.status).toBe(400);
    expect(r.text).toMatch(/50MB/);

    const listAfter = (await call("GET", `/courses/${courseA}/materials`, userA.token)).body.data.length;
    const minioAfter = await listMinioObjects(prefix);

    // L1: Check MinIO objects and DB
    expect(listAfter).toBe(listBefore);
    expect(minioAfter.length).toBe(minioBefore.length);
  }, 180000);

  t("QA-003 AC-2: boundary file of exactly 50 MB passes upload size check", async () => {
    const r = await call(
      "POST",
      `/courses/${courseA}/materials`,
      userA.token,
      form("exact50mb.pdf", Buffer.alloc(50 * MB, 0x20), PDF)
    );

    expect(r.status).toBe(201);
    createdMaterialIds.push(r.body.data.id);
    expect(Number(r.body.data.size_bytes)).toBe(50 * MB);
    // Parsing this mock buffer will fail downstream, but the upload size boundary is respected
    expect(["PENDING", "PROCESSING", "FAILED"]).toContain(r.body.data.processing_status);
  }, 180000);

  t("QA-003 AC-2: request without a file payload is rejected with 400", async () => {
    const r = await call("POST", `/courses/${courseA}/materials`, userA.token, new FormData());
    expect(r.status).toBe(400);
    expect(r.text).toMatch(/No file provided/);
  });

  // ---------------------------------------------------------------------------
  // QA-003 AC-3: Kiểm thử xử lý lỗi mạng và hiển thị trạng thái retry
  // ---------------------------------------------------------------------------
  const aiDownLive = live && process.env.QA_AI_DOWN === "1";
  const aiDownSkipReason = !aiDownLive
    ? " [SKIPPED: QA_AI_DOWN=1 unset; requires operator to stop ai-service container]"
    : "";
  (aiDownLive ? t : it.skip)(
    `QA-003 AC-3: when AI service is unreachable, upload completes safely and material transitions to FAILED with processing_error${aiDownSkipReason}`,
    async () => {
      // Review run 4 M1: "Unreachable" means the health fetch throws (no HTTP response).
      // Any HTTP response (including 5xx) means the service received the request and is reachable.
      let aiReachable = false;
      let reachStatus = "";
      try {
        const hRes = await fetch(`${AI_SERVICE_BASE_URL}/health`, { signal: AbortSignal.timeout(2000) });
        aiReachable = true;
        reachStatus = `HTTP ${hRes.status}`;
      } catch {
        aiReachable = false;
      }
      if (aiReachable) {
        throw new Error(
          `QA_AI_DOWN=1 was specified, but AI service is reachable at ${AI_SERVICE_BASE_URL}/health (${reachStatus}). The operator must stop the AI service container before running this test.`
        );
      }

      // H3: Backend handles AI service outage gracefully: upload returns 201, status is FAILED with error
      const fileBytes = fs.readFileSync(path.join(FIXTURES, "sample.pdf"));
      const r = await call("POST", `/courses/${courseA}/materials`, userA.token, form("outage-test.pdf", fileBytes, PDF));

      expect(r.status).toBe(201);
      const mat = r.body.data;
      createdMaterialIds.push(mat.id);

      // Verify that failure was recorded with clear network connection error and not reported as success
      expect(mat.processing_status).toBe("FAILED");
      expect(mat.processing_error).toMatch(/fetch failed|ECONNREFUSED|ENOTFOUND|ETIMEDOUT|EHOSTUNREACH|UND_ERR_CONNECT/i);
      expect(mat.chunk_count ?? 0).toBe(0);
    }
  );

  // ---------------------------------------------------------------------------
  // Extra checks: Ingestion failure status integrity (FND §6)
  // QA_EMBEDDINGS=1: Set when a real embedding key is configured; otherwise the FND §6 failure test expects FAILED.
  // ---------------------------------------------------------------------------
  const hasEmbeddingKey = process.env.QA_EMBEDDINGS === "1";
  (live && !hasEmbeddingKey ? t : it.skip)(
    `extra: FND §6 ingestion failure reports FAILED with non-empty error and zero chunks${hasEmbeddingKey ? " [SKIPPED: QA_EMBEDDINGS=1 is set; materials complete ingestion rather than failing]" : ""}`,
    async () => {
      // M-c: Seed its own material without relying on earlier tests
      const fileBytes = fs.readFileSync(path.join(FIXTURES, "sample.pdf"));
      const upRes = await call(
        "POST",
        `/courses/${courseA}/materials`,
        userA.token,
        form("seeded-fail.pdf", fileBytes, PDF)
      );
      expect(upRes.status).toBe(201);
      const seededMatId = upRes.body.data.id;
      createdMaterialIds.push(seededMatId);

      // Poll until the seeded material reaches terminal FAILED status
      let seededMat: any;
      const start = Date.now();
      while (Date.now() - start < 30000) {
        const getRes = await call("GET", `/materials/${seededMatId}`, userA.token);
        if (
          getRes.status === 200 &&
          getRes.body.data.processing_status !== "PENDING" &&
          getRes.body.data.processing_status !== "PROCESSING"
        ) {
          seededMat = getRes.body.data;
          break;
        }
        await new Promise((r) => setTimeout(r, 1000));
      }

      expect(seededMat).toBeDefined();
      expect(seededMat.processing_status).toBe("FAILED");
      expect(seededMat.processing_error).toBeTruthy();
      expect(seededMat.chunk_count ?? 0).toBe(0);
    }
  );
});
