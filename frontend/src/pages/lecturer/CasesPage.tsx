import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";

interface CaseItem {
  id: string;
  title: string;
  description: string;
  status: "DRAFT" | "REVIEWED" | "APPROVED" | "PUBLISHED";
  learning_mode: "BRANCHING_STUDY" | "REVIEW_STUDY";
  root_node_id: string | null;
  created_at: string;
  updated_at: string;
}

interface TeachingMaterial {
  id: string;
  original_filename: string;
  processing_status: string;
  chunk_count: number;
}

export function CasesPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [cases, setCases] = useState<CaseItem[]>([]);
  const [materials, setMaterials] = useState<TeachingMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states for generation
  const [topicHint, setTopicHint] = useState("");
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [numNodes, setNumNodes] = useState(4);

  const fetchCasesAndMaterials = async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      const [casesRes, matsRes] = await Promise.all([
        apiClient.get(`/courses/${courseId}/cases`),
        apiClient.get(`/courses/${courseId}/materials`),
      ]);

      if (casesRes.data?.data) {
        setCases(casesRes.data.data);
      }
      if (matsRes.data?.data) {
        const completed = matsRes.data.data.filter(
          (m: TeachingMaterial) => m.processing_status === "COMPLETED"
        );
        setMaterials(completed);
        if (completed.length > 0 && selectedMaterials.length === 0) {
          setSelectedMaterials(completed.map((m: TeachingMaterial) => m.id));
        }
      }
    } catch (err: any) {
      console.error("Error loading cases or materials:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCasesAndMaterials();
  }, [courseId]);

  const handleGenerateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (selectedMaterials.length === 0) {
      setErrorMessage("Please select at least one ingested teaching material to provide RAG context.");
      return;
    }

    try {
      setGenerating(true);
      const response = await apiClient.post("/cases/generate", {
        courseId,
        materialIds: selectedMaterials,
        topicHint: topicHint.trim() || undefined,
        numNodes,
      });

      const newCase = response.data?.data;
      if (newCase && newCase.id) {
        setShowModal(false);
        navigate(`/lecturer/cases/${newCase.id}/review`);
      } else {
        await fetchCasesAndMaterials();
        setShowModal(false);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Case generation failed";
      setErrorMessage(msg);
    } finally {
      setGenerating(false);
    }
  };

  const getStatusBadge = (status: CaseItem["status"]) => {
    switch (status) {
      case "DRAFT":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">DRAFT</span>;
      case "REVIEWED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">REVIEWED</span>;
      case "APPROVED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">APPROVED</span>;
      case "PUBLISHED":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">PUBLISHED</span>;
      default:
        return null;
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
        <span className="text-gray-900 font-medium">Case Studies</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-200 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Case Studies</h1>
          <p className="text-sm text-gray-500 mt-1">
            Author and review branching decision-tree case studies powered by RAG from course syllabus materials.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <Link
            to={`/lecturer/courses/${courseId}/materials`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Manage Materials ({materials.length})
          </Link>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
          >
            + Generate Case Draft
          </button>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-red-500 font-bold ml-4">
            &times;
          </button>
        </div>
      )}

      {/* Cases List */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Cases</h2>
          <button
            onClick={fetchCasesAndMaterials}
            disabled={loading}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading cases...</div>
        ) : cases.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600 font-medium">No case studies created for this course yet.</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">
              Click &quot;Generate Case Draft&quot; to synthesize an interactive branching decision tree from your course materials.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Generate First Case
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {cases.map((c) => (
              <div
                key={c.id}
                className="p-6 hover:bg-gray-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between"
              >
                <div className="flex-1 pr-4">
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="text-base font-semibold text-gray-900">{c.title}</h3>
                    {getStatusBadge(c.status)}
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {c.learning_mode}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{c.description}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Updated {new Date(c.updated_at).toLocaleString()}
                  </p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-2">
                  <Link
                    to={`/lecturer/cases/${c.id}/review`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Open Decision Tree &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Generate Case Draft</h2>
            <p className="text-xs text-gray-500 mb-4">
              AI synthesizes a multi-step decision tree using RAG retrieval from your uploaded teaching materials.
            </p>

            <form onSubmit={handleGenerateCase}>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Topic / Scenario Hint
                </label>
                <input
                  type="text"
                  value={topicHint}
                  onChange={(e) => setTopicHint(e.target.value)}
                  placeholder="e.g. Ethical dilemmas in financial reporting and auditing"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Reference Materials (RAG Context)
                </label>
                {materials.length === 0 ? (
                  <p className="text-xs text-amber-600">
                    No completed teaching materials found. Please upload materials first.
                  </p>
                ) : (
                  <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-md p-2 space-y-1">
                    {materials.map((m) => (
                      <label key={m.id} className="flex items-center space-x-2 text-xs text-gray-700 hover:bg-gray-50 p-1 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedMaterials.includes(m.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMaterials([...selectedMaterials, m.id]);
                            } else {
                              setSelectedMaterials(selectedMaterials.filter((id) => id !== m.id));
                            }
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="truncate">{m.original_filename}</span>
                        <span className="text-gray-400">({m.chunk_count} chunks)</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Target Decision Tree Nodes: {numNodes}
                </label>
                <input
                  type="range"
                  min="2"
                  max="8"
                  value={numNodes}
                  onChange={(e) => setNumNodes(Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>2 (Compact)</span>
                  <span>4 (Standard)</span>
                  <span>8 (Deep branching)</span>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={generating}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating || materials.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {generating ? "Generating with RAG..." : "Generate Draft"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
