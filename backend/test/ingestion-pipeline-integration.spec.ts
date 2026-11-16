/**
 * EduBranch AI — Sprint 2 QA Suite: Ingestion Pipeline Integration (QA-005 / EBA-219).
 *
 * Acceptance Criteria (from docs/03_TASK-DETAILS.md §[29] and docs/06_QA.md):
 *   - QA-005 AC-1: Kiểm thử tự động xuyên suốt: Upload file → MinIO → Parsing → Chunking → Embeddings lưu vào pgvector.
 *   - QA-005 AC-2: Kiểm thử khả năng phục hồi khi file rỗng hoặc chứa ký tự đặc biệt.
 *
 * Review Findings & Architecture Notes:
 *   - H1: Gating on real embedding provider keys: When QA_EMBEDDINGS=1 is set by the operator,
 *         the test asserts COMPLETED and chunk_count > 0. Without this flag, the test is
 *         skipped with reason 'BLOCKED: no embedding provider key (AI_PROVIDER=<provider>)'.
 *         Using an explicit QA_EMBEDDINGS flag avoids reading secrets in test code and prevents
 *         false passes in environments without active provider credentials.
 *   - H2: Real end-to-end verification queries document_chunks directly via PostgreSQL connection,
 *         asserting that row count == chunk_count, vector_dims(embedding) == 768, and all rows
 *         match the respective course_id and material_id.
 *   - M3: Uses shared in-process user caching with 429 rate limit backoff.
 *   - M4: Shared fixtures created in beforeAll; API material cleanup followed by direct
 *         PostgreSQL cleanup in afterAll.
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
  PDF,
  call,
  cleanupDatabaseEntities,
  createPgPool,
  env,
  form,
  getOrCreateTestUser,
  live,
  t,
  teardownQaLive,
  TestUser,
} from "./helpers/qa-live";

describe("QA-005 Integration Test Suite for End-to-End Ingestion Pipeline (Upload to pgvector)", () => {
  let userA: TestUser;
  let courseA: string;
  let pool: Pool;
  const createdMaterialIds: string[] = [];
  const createdCourseIds: string[] = [];
  const createdUserIds: string[] = [];

  const hasEmbeddingKey = process.env.QA_EMBEDDINGS === "1";
  const aiProvider = env("AI_PROVIDER", "gemini");

  beforeAll(async () => {
    if (!live) return;
    const h = await fetch(`${API}/health`);
    if (h.status >= 500) throw new Error(`API ${API}/health -> ${h.status}`);

    pool = createPgPool();

    userA = await getOrCreateTestUser("lecA");
    createdUserIds.push(userA.id);

    const cRes = await call("POST", "/courses", userA.token, {
      name: `QA-005 Ingestion Course ${Date.now()}`,
      courseCode: `ING${Date.now() % 100000}`,
    });
    if (cRes.status !== 201) throw new Error(`create course failed: ${cRes.status} ${cRes.text}`);
    courseA = cRes.body.data.id;
    createdCourseIds.push(courseA);
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

  async function pollMaterialUntilDone(materialId: string, maxWaitMs = 45000): Promise<any> {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      const res = await call("GET", `/materials/${materialId}`, userA.token);
      if (res.status === 200) {
        const status = res.body.data.processing_status;
        if (status !== "PENDING" && status !== "PROCESSING") {
          return res.body.data;
        }
      }
      await new Promise((r) => setTimeout(r, 1500));
    }
    const finalRes = await call("GET", `/materials/${materialId}`, userA.token);
    return finalRes.body?.data;
  }

  // ---------------------------------------------------------------------------
  // QA-005 AC-1: Upload file → MinIO → Parsing → Chunking → Embeddings lưu vào pgvector
  // ---------------------------------------------------------------------------
  const testAc1 = live && hasEmbeddingKey ? t : it.skip;
  const ac1SkipNote = !hasEmbeddingKey ? ` [BLOCKED: no embedding provider key (AI_PROVIDER=${aiProvider})]` : "";

  testAc1(
    `QA-005 AC-1: end-to-end ingestion pipeline: Upload PDF -> MinIO -> Parsing -> Chunking -> pgvector embeddings${ac1SkipNote}`,
    async () => {
      // H1 & H2: Real end-to-end test with pgvector verification
      const fileBytes = fs.readFileSync(path.join(FIXTURES, "sample.pdf"));
      const upRes = await call(
        "POST",
        `/courses/${courseA}/materials`,
        userA.token,
        form("ingest-sample.pdf", fileBytes, PDF)
      );
      expect(upRes.status).toBe(201);
      const matId = upRes.body.data.id;
      createdMaterialIds.push(matId);

      // Poll until ingestion finishes
      const finishedMat = await pollMaterialUntilDone(matId);
      expect(finishedMat.processing_status).toBe("COMPLETED");
      expect(finishedMat.chunk_count).toBeGreaterThan(0);

      // Connect to PostgreSQL and verify pgvector chunks directly (Review run 2 Item 3: uses shared pool)
      const queryRes = await pool.query(
        `SELECT id, course_id, material_id, chunk_index, chunk_text, vector_dims(embedding) AS dims
         FROM document_chunks
         WHERE material_id = $1
         ORDER BY chunk_index ASC`,
        [matId]
      );

      expect(queryRes.rows.length).toBe(finishedMat.chunk_count);
      for (let i = 0; i < queryRes.rows.length; i++) {
        const row = queryRes.rows[i];
        expect(row.dims).toBe(768);
        expect(row.course_id).toBe(courseA);
        expect(row.material_id).toBe(matId);
        expect(row.chunk_index).toBe(i);
        expect(row.chunk_text.trim().length).toBeGreaterThan(0);
      }
    },
    90000
  );

  testAc1(
    `QA-005 AC-1: end-to-end ingestion pipeline: Upload DOCX -> MinIO -> Parsing -> Chunking -> pgvector embeddings${ac1SkipNote}`,
    async () => {
      const fileBytes = fs.readFileSync(path.join(FIXTURES, "sample.docx"));
      const upRes = await call(
        "POST",
        `/courses/${courseA}/materials`,
        userA.token,
        form("ingest-sample.docx", fileBytes, DOCX)
      );
      expect(upRes.status).toBe(201);
      const matId = upRes.body.data.id;
      createdMaterialIds.push(matId);

      const finishedMat = await pollMaterialUntilDone(matId);
      expect(finishedMat.processing_status).toBe("COMPLETED");
      expect(finishedMat.chunk_count).toBeGreaterThan(0);

      const queryRes = await pool.query(
        `SELECT id, course_id, material_id, chunk_index, chunk_text, vector_dims(embedding) AS dims
         FROM document_chunks
         WHERE material_id = $1
         ORDER BY chunk_index ASC`,
        [matId]
      );

      expect(queryRes.rows.length).toBe(finishedMat.chunk_count);
      for (let i = 0; i < queryRes.rows.length; i++) {
        const row = queryRes.rows[i];
        expect(row.dims).toBe(768);
        expect(row.course_id).toBe(courseA);
        expect(row.material_id).toBe(matId);
        expect(row.chunk_index).toBe(i);
      }
    },
    90000
  );

  // ---------------------------------------------------------------------------
  // QA-005 AC-2: Kiểm thử khả năng phục hồi khi file rỗng hoặc chứa ký tự đặc biệt
  // ---------------------------------------------------------------------------
  t("QA-005 AC-2: corrupt or unparseable document fails cleanly without storing orphaned chunks", async () => {
    // Corrupt PDF bytes that pass declared MIME check but fail parsing
    const upRes = await call(
      "POST",
      `/courses/${courseA}/materials`,
      userA.token,
      form("corrupt.pdf", Buffer.from("%PDF-1.4 truncated corrupt content"), PDF)
    );
    expect(upRes.status).toBe(201);
    const matId = upRes.body.data.id;
    createdMaterialIds.push(matId);

    const finishedMat = await pollMaterialUntilDone(matId);
    expect(finishedMat.processing_status).toBe("FAILED");
    expect(finishedMat.processing_error).toBeTruthy();
    expect(finishedMat.processing_error).toMatch(/\(422\)|Corrupted or invalid/i);

    // Verify in PostgreSQL that no chunk records were stored
    const queryRes = await pool.query(
      "SELECT COUNT(*)::int AS count FROM document_chunks WHERE material_id = $1",
      [matId]
    );
    expect(queryRes.rows[0].count).toBe(0);
  });
});
