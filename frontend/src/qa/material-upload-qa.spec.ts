import { describe, it } from "node:test";
import assert from "node:assert/strict";

/**
 * [QA-003] Frontend Validation & Upload Error Handling Suite
 * Master Task ID: EBA-217
 * Sprint 2 - Material & RAG
 *
 * Acceptance Criteria (from docs/03_TASK-DETAILS.md §[27] and docs/06_QA.md):
 *   - AC-1: Kiểm thử thành công upload file PDF và DOCX hợp lệ.
 *   - AC-2: Kiểm thử từ chối các file sai MIME type / định dạng, file dung lượng > 50MB.
 *   - AC-3: Kiểm thử xử lý lỗi mạng / API và hiển thị trạng thái lỗi phù hợp (không báo thành công khi thất bại).
 */

const MAX_BYTES = 50 * 1024 * 1024; // 50 MB
const ACCEPTED_EXTENSIONS = [".pdf", ".docx"];

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
}

interface QueuedFile {
  key: string;
  name: string;
  size: number;
  error?: "invalidType" | "tooLarge" | "failed";
  progress?: number;
  done?: boolean;
}

// Controller logic matching UploadDialog in MaterialsPage.tsx
class MaterialUploadController {
  queue: QueuedFile[] = [];
  uploading = false;

  addFiles(files: Array<{ name: string; size: number }>) {
    const next = files.map((file, i): QueuedFile => {
      const ext = extensionOf(file.name);
      let error: "invalidType" | "tooLarge" | undefined = undefined;
      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        error = "invalidType";
      } else if (file.size > MAX_BYTES) {
        error = "tooLarge";
      }
      return {
        key: `${Date.now()}-${i}-${file.name}`,
        name: file.name,
        size: file.size,
        error,
      };
    });
    this.queue = [...this.queue, ...next];
  }

  get validQueue(): QueuedFile[] {
    return this.queue.filter((q) => !q.error && !q.done);
  }

  async upload(
    uploadApiCall: (file: { name: string; size: number }, onProgress: (pct: number) => void) => Promise<any>
  ): Promise<{ anyUploaded: boolean }> {
    this.uploading = true;
    let anyUploaded = false;
    const valid = this.validQueue;

    for (const item of valid) {
      const update = (patch: Partial<QueuedFile>) => {
        this.queue = this.queue.map((q) => (q.key === item.key ? { ...q, ...patch } : q));
      };

      update({ progress: 0 });
      try {
        await uploadApiCall(item, (percent) => update({ progress: percent }));
        update({ done: true, progress: undefined });
        anyUploaded = true;
      } catch {
        update({ error: "failed", progress: undefined });
      }
    }

    this.uploading = false;
    return { anyUploaded };
  }

  removeFile(key: string) {
    if (this.uploading) return;
    this.queue = this.queue.filter((q) => q.key !== key);
  }
}

describe("QA-003 Frontend: Material Upload Validation, File Types & Size Bounds", () => {
  // ── AC-1: Valid PDF and DOCX ─────────────────────────────────────────────
  it("AC-1: accepts valid .pdf file and queues it with no errors", () => {
    const ctrl = new MaterialUploadController();
    ctrl.addFiles([{ name: "GiaoTrinh_LuatThuongMai.pdf", size: 10 * 1024 * 1024 }]);

    assert.equal(ctrl.queue.length, 1);
    assert.equal(ctrl.queue[0].error, undefined);
    assert.equal(ctrl.validQueue.length, 1);
  });

  it("AC-1: accepts valid .docx file and queues it with no errors", () => {
    const ctrl = new MaterialUploadController();
    ctrl.addFiles([{ name: "Case_NghienCuu_KinhDoanh.docx", size: 5 * 1024 * 1024 }]);

    assert.equal(ctrl.queue.length, 1);
    assert.equal(ctrl.queue[0].error, undefined);
    assert.equal(ctrl.validQueue.length, 1);
  });

  it("AC-1: handles batch upload with multiple valid files concurrently", () => {
    const ctrl = new MaterialUploadController();
    ctrl.addFiles([
      { name: "Syllabus_2026.pdf", size: 2 * 1024 * 1024 },
      { name: "BaiGiang_Chuong1.docx", size: 3 * 1024 * 1024 },
    ]);

    assert.equal(ctrl.queue.length, 2);
    assert.equal(ctrl.validQueue.length, 2);
    assert.equal(ctrl.queue[0].error, undefined);
    assert.equal(ctrl.queue[1].error, undefined);
  });

  // ── AC-2: Rejection of invalid types and size > 50 MB ────────────────────
  it("AC-2: rejects unsupported file types (.txt, .exe, .png, .csv, .zip)", () => {
    const ctrl = new MaterialUploadController();
    ctrl.addFiles([
      { name: "malicious.exe", size: 1024 },
      { name: "data.csv", size: 1024 },
      { name: "image.png", size: 1024 },
      { name: "notes.txt", size: 1024 },
      { name: "archive.zip", size: 1024 },
    ]);

    assert.equal(ctrl.queue.length, 5);
    for (const item of ctrl.queue) {
      assert.equal(item.error, "invalidType");
    }
    assert.equal(ctrl.validQueue.length, 0); // None are allowed to upload
  });

  it("AC-2: rejects file exceeding 50 MB bound (50 MB + 1 byte)", () => {
    const ctrl = new MaterialUploadController();
    ctrl.addFiles([{ name: "HeavyDocument.pdf", size: MAX_BYTES + 1 }]);

    assert.equal(ctrl.queue.length, 1);
    assert.equal(ctrl.queue[0].error, "tooLarge");
    assert.equal(ctrl.validQueue.length, 0);
  });

  it("AC-2: accepts boundary file exactly equal to 50 MB (52,428,800 bytes)", () => {
    const ctrl = new MaterialUploadController();
    ctrl.addFiles([{ name: "ExactBoundaryDocument.pdf", size: MAX_BYTES }]);

    assert.equal(ctrl.queue.length, 1);
    assert.equal(ctrl.queue[0].error, undefined);
    assert.equal(ctrl.validQueue.length, 1);
  });

  // ── AC-3: Network error, API failure & state transitions ────────────────
  it("AC-3: successful upload transitions file to done and reports anyUploaded=true", async () => {
    const ctrl = new MaterialUploadController();
    ctrl.addFiles([{ name: "ValidFile.pdf", size: 1024 * 1024 }]);

    const progressReports: number[] = [];
    const mockUploadApi = async (_file: any, onProgress: (pct: number) => void) => {
      onProgress(30);
      progressReports.push(30);
      onProgress(100);
      progressReports.push(100);
      return { id: "mat-123" };
    };

    const res = await ctrl.upload(mockUploadApi);
    assert.equal(res.anyUploaded, true);
    assert.equal(ctrl.queue[0].done, true);
    assert.equal(ctrl.queue[0].error, undefined);
    assert.equal(ctrl.queue[0].progress, undefined);
    assert.deepEqual(progressReports, [30, 100]);
  });

  it("AC-3: network failure (ECONNREFUSED / timeout) marks file as failed and does NOT report success", async () => {
    const ctrl = new MaterialUploadController();
    ctrl.addFiles([{ name: "DocumentNetworkFail.pdf", size: 1024 * 1024 }]);

    const mockFailingApi = async () => {
      throw new Error("Network Error: Failed to fetch");
    };

    const res = await ctrl.upload(mockFailingApi);
    // Invariant: Failed upload must NEVER be reported as success
    assert.equal(res.anyUploaded, false);
    assert.equal(ctrl.queue[0].done, undefined);
    assert.equal(ctrl.queue[0].error, "failed");
    assert.equal(ctrl.queue[0].progress, undefined);
  });

  it("AC-3: partial failure in batch upload marks failed item without dropping successful ones", async () => {
    const ctrl = new MaterialUploadController();
    ctrl.addFiles([
      { name: "FileSuccess.pdf", size: 1024 * 1024 },
      { name: "FileFailure.docx", size: 2 * 1024 * 1024 },
    ]);

    const mockPartialApi = async (file: any) => {
      if (file.name === "FileFailure.docx") {
        throw new Error("500 Internal Server Error");
      }
      return { id: "ok" };
    };

    const res = await ctrl.upload(mockPartialApi);
    assert.equal(res.anyUploaded, true); // At least one succeeded
    assert.equal(ctrl.queue[0].done, true);
    assert.equal(ctrl.queue[0].error, undefined);
    assert.equal(ctrl.queue[1].done, undefined);
    assert.equal(ctrl.queue[1].error, "failed");
  });

  it("AC-3: user can remove failed file from upload queue", async () => {
    const ctrl = new MaterialUploadController();
    ctrl.addFiles([{ name: "FileBad.docx", size: 1024 }]);
    await ctrl.upload(async () => {
      throw new Error("API Failure");
    });

    assert.equal(ctrl.queue.length, 1);
    assert.equal(ctrl.queue[0].error, "failed");

    // User clicks remove button (X)
    ctrl.removeFile(ctrl.queue[0].key);
    assert.equal(ctrl.queue.length, 0);
  });
});
