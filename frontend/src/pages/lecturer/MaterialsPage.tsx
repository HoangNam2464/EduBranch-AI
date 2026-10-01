import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import apiClient from "../../services/apiClient";

interface TeachingMaterial {
  id: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  processing_status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  chunk_count: number | null;
  processing_error: string | null;
  uploaded_at: string;
}

export function MaterialsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [materials, setMaterials] = useState<TeachingMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMaterials = async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/courses/${courseId}/materials`);
      if (res.data?.data) {
        setMaterials(res.data.data);
      }
    } catch (err: any) {
      console.error("Failed to load materials:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [courseId]);

  const handleFileUpload = async (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const allowedExtensions = [".pdf", ".docx"];
    const fileExt = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      setErrorMessage("Only PDF and DOCX files are supported.");
      return;
    }

    const maxSizeBytes = 50 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrorMessage("File exceeds the 50MB limit.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await apiClient.post(`/courses/${courseId}/materials`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploaded = res.data?.data;
      setSuccessMessage(
        `Material "${file.name}" uploaded successfully! Status: ${uploaded?.processing_status || "COMPLETED"} (${uploaded?.chunk_count || 0} chunks).`
      );
      await fetchMaterials();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to upload material";
      setErrorMessage(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatDate = (iso: string): string => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center space-x-2 text-sm text-gray-500">
        <Link to="/lecturer/courses" className="hover:text-blue-600 transition-colors">
          Courses
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Course Materials</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-200 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teaching Materials</h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload PDF or DOCX course readings and syllabus materials to power AI Case Generation and RAG retrieval.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link
            to={`/lecturer/courses/${courseId}/cases`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Go to Course Cases &rarr;
          </Link>
        </div>
      </div>

      {/* Alert Messages */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-red-500 font-bold ml-4">
            &times;
          </button>
        </div>
      )}
      {successMessage && (
        <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-center justify-between">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-green-500 font-bold ml-4">
            &times;
          </button>
        </div>
      )}

      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors mb-10 ${
          dragActive ? "border-blue-500 bg-blue-50/50" : "border-gray-300 bg-gray-50/50 hover:bg-gray-50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          id="material-file-upload"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
          disabled={uploading}
        />
        <label
          htmlFor="material-file-upload"
          className={`cursor-pointer inline-flex flex-col items-center ${
            uploading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <div className="w-12 h-12 mb-3 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
            ↑
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {uploading ? "Processing and embedding document..." : "Click to upload or drag and drop"}
          </span>
          <span className="text-xs text-gray-500 mt-1">
            Supported formats: PDF, DOCX (Max 50MB per file)
          </span>
        </label>
      </div>

      {/* Materials Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Uploaded Documents</h2>
          <button
            onClick={fetchMaterials}
            disabled={loading}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading materials...</div>
        ) : materials.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-sm">No teaching materials uploaded for this course yet.</p>
            <p className="text-xs text-gray-400 mt-1">Upload a PDF or DOCX syllabus or case reading above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3">Document Name</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Size</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Chunks</th>
                  <th className="px-6 py-3">Uploaded At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {materials.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center space-x-2">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                        {m.original_filename.endsWith(".pdf") ? "PDF" : "DOCX"}
                      </span>
                      <span>{m.original_filename}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{m.mime_type}</td>
                    <td className="px-6 py-4 text-gray-500">{formatFileSize(m.size_bytes)}</td>
                    <td className="px-6 py-4">
                      {m.processing_status === "COMPLETED" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Completed
                        </span>
                      )}
                      {(m.processing_status === "PENDING" || m.processing_status === "PROCESSING") && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Processing...
                        </span>
                      )}
                      {m.processing_status === "FAILED" && (
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                          title={m.processing_error || "Processing failed"}
                        >
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                      {m.chunk_count !== null ? `${m.chunk_count} chunks` : "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(m.uploaded_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
