import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  Handle,
} from "reactflow";
import "reactflow/dist/style.css";
import apiClient from "../../services/apiClient";

interface CaseOption {
  id: string;
  node_id: string;
  option_text: string;
  consequence: string;
  next_node_id: string | null;
}

interface CaseNode {
  id: string;
  case_id: string;
  situation: string;
  is_terminal: boolean;
  node_index: number;
  options: CaseOption[];
}

interface CaseDetail {
  id: string;
  title: string;
  description: string;
  course_id: string;
  status: "DRAFT" | "REVIEWED" | "APPROVED" | "PUBLISHED";
  learning_mode: "BRANCHING_STUDY" | "REVIEW_STUDY";
  root_node_id: string | null;
  nodes: CaseNode[];
}

// Custom Node Component for ReactFlow
function CaseBranchNode({ data, selected }: { data: any; selected: boolean }) {
  const isRoot = data.isRoot;
  const isTerminal = data.isTerminal;

  return (
    <div
      className={`px-4 py-3 rounded-lg shadow-md border-2 bg-white text-left max-w-xs transition-all ${
        selected
          ? "border-blue-600 ring-2 ring-blue-200"
          : isRoot
          ? "border-emerald-500 bg-emerald-50/20"
          : isTerminal
          ? "border-rose-400 bg-rose-50/20"
          : "border-gray-200"
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 bg-blue-500" />
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Node {data.nodeIndex + 1}
        </span>
        <div className="flex space-x-1">
          {isRoot && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
              ROOT
            </span>
          )}
          {isTerminal && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
              TERMINAL
            </span>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-800 font-medium line-clamp-3">{data.situation}</p>
      <div className="mt-2 text-[10px] text-gray-400 flex justify-between">
        <span>{data.optionsCount} option{data.optionsCount !== 1 ? "s" : ""}</span>
        <span className="text-blue-600 font-semibold">Click to edit</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 bg-blue-500" />
    </div>
  );
}

export function CaseReviewPage() {
  const { caseId } = useParams<{ caseId: string }>();

  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [selectedNode, setSelectedNode] = useState<CaseNode | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const nodeTypes = useMemo(() => ({ caseNode: CaseBranchNode }), []);

  const loadCase = useCallback(async () => {
    if (!caseId) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/cases/${caseId}`);
      if (res.data?.data) {
        const c: CaseDetail = res.data.data;
        setCaseData(c);

        // Convert case nodes into ReactFlow nodes and edges
        const rawNodes = c.nodes || [];
        const rfNodes: Node[] = [];
        const rfEdges: Edge[] = [];

        const colWidth = 280;
        const rowHeight = 180;
        const total = rawNodes.length;

        rawNodes.forEach((node, idx) => {
          // Layout in a grid/tree formation
          const x = 50 + (idx % 3) * colWidth;
          const y = 50 + Math.floor(idx / 3) * rowHeight;

          rfNodes.push({
            id: node.id,
            type: "caseNode",
            position: { x, y },
            data: {
              situation: node.situation,
              nodeIndex: node.node_index,
              isRoot: node.id === c.root_node_id,
              isTerminal: node.is_terminal || !node.options || node.options.length === 0,
              optionsCount: node.options ? node.options.length : 0,
            },
          });

          if (node.options && Array.isArray(node.options)) {
            node.options.forEach((opt, optIdx) => {
              if (opt.next_node_id) {
                rfEdges.push({
                  id: `edge-${node.id}-${opt.id}`,
                  source: node.id,
                  target: opt.next_node_id,
                  label: opt.option_text ? opt.option_text.slice(0, 24) + "..." : `Option ${optIdx + 1}`,
                  type: "smoothstep",
                  markerEnd: { type: MarkerType.ArrowClosed },
                  style: { stroke: "#6366f1", strokeWidth: 2 },
                  labelStyle: { fill: "#4338ca", fontSize: 10, fontWeight: 600 },
                });
              }
            });
          }
        });

        setNodes(rfNodes);
        setEdges(rfEdges);
        if (rawNodes.length > 0 && !selectedNode) {
          setSelectedNode(rawNodes[0]);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || "Failed to load case");
    } finally {
      setLoading(false);
    }
  }, [caseId, setNodes, setEdges]);

  useEffect(() => {
    loadCase();
  }, [loadCase]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (caseData?.nodes) {
        const found = caseData.nodes.find((n) => n.id === node.id);
        if (found) {
          setSelectedNode(found);
        }
      }
    },
    [caseData]
  );

  const handleUpdateStatus = async (
    newStatus: "DRAFT" | "REVIEWED" | "APPROVED" | "PUBLISHED"
  ) => {
    if (!caseId) return;
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      setStatusUpdating(true);
      await apiClient.patch(`/cases/${caseId}/status`, { status: newStatus });
      setStatusMessage(`Case successfully transitioned to ${newStatus}`);
      await loadCase();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || "Failed to update case status");
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleSaveEdits = async () => {
    if (!caseId || !caseData) return;
    setSaving(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      await apiClient.put(`/cases/${caseId}`, {
        title: caseData.title,
        description: caseData.description,
        nodes: caseData.nodes,
      });
      setStatusMessage("Case modifications saved successfully.");
      await loadCase();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || "Failed to save edits");
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: CaseDetail["status"]) => {
    switch (status) {
      case "DRAFT":
        return "bg-amber-100 text-amber-900 border-amber-300";
      case "REVIEWED":
        return "bg-blue-100 text-blue-900 border-blue-300";
      case "APPROVED":
        return "bg-purple-100 text-purple-900 border-purple-300";
      case "PUBLISHED":
        return "bg-emerald-100 text-emerald-900 border-emerald-300";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500 text-sm">Loading decision tree case review...</div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <p className="text-red-600">Case not found.</p>
        <Link to="/lecturer/courses" className="mt-4 text-blue-600 underline text-sm">
          Back to Courses
        </Link>
      </div>
    );
  }

  const isEditable = caseData.status === "DRAFT" || caseData.status === "REVIEWED";

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Top Lifecycle Action Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4 z-10 shadow-sm">
        <div className="flex items-center space-x-3">
          <Link
            to={`/lecturer/courses/${caseData.course_id}/cases`}
            className="text-xs text-gray-500 hover:text-gray-800"
          >
            &larr; Cases
          </Link>
          <span className="text-gray-300">|</span>
          <h1 className="text-base font-bold text-gray-900 truncate max-w-md">
            {caseData.title}
          </h1>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
              caseData.status
            )}`}
          >
            {caseData.status}
          </span>
        </div>

        {/* Lifecycle Transitions (Human-in-the-Loop) */}
        <div className="flex items-center space-x-2">
          {caseData.status === "DRAFT" && (
            <button
              onClick={() => handleUpdateStatus("REVIEWED")}
              disabled={statusUpdating}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700 shadow-sm"
            >
              Mark as Reviewed &rarr;
            </button>
          )}

          {caseData.status === "REVIEWED" && (
            <>
              <button
                onClick={() => handleUpdateStatus("DRAFT")}
                disabled={statusUpdating}
                className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-50"
              >
                Revert to Draft
              </button>
              <button
                onClick={() => handleUpdateStatus("APPROVED")}
                disabled={statusUpdating}
                className="px-3 py-1.5 bg-purple-600 text-white rounded-md text-xs font-semibold hover:bg-purple-700 shadow-sm"
              >
                Approve Case &rarr;
              </button>
            </>
          )}

          {caseData.status === "APPROVED" && (
            <>
              <button
                onClick={() => handleUpdateStatus("REVIEWED")}
                disabled={statusUpdating}
                className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-50"
              >
                Revert to Reviewed
              </button>
              <button
                onClick={() => handleUpdateStatus("PUBLISHED")}
                disabled={statusUpdating}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-md text-xs font-semibold hover:bg-emerald-700 shadow-sm"
              >
                Publish Case to Students &rarr;
              </button>
            </>
          )}

          {caseData.status === "PUBLISHED" && (
            <button
              onClick={() => handleUpdateStatus("APPROVED")}
              disabled={statusUpdating}
              className="px-3 py-1.5 border border-amber-400 text-amber-800 rounded-md text-xs font-medium hover:bg-amber-50"
            >
              Unpublish (Revert to Approved)
            </button>
          )}

          {isEditable && (
            <button
              onClick={handleSaveEdits}
              disabled={saving}
              className="px-3 py-1.5 border border-gray-300 bg-white text-gray-800 rounded-md text-xs font-medium hover:bg-gray-50 shadow-sm"
            >
              {saving ? "Saving..." : "Save Edits"}
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {statusMessage && (
        <div className="bg-green-50 px-6 py-2 border-b border-green-200 text-green-800 text-xs flex justify-between items-center">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="font-bold">&times;</button>
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-50 px-6 py-2 border-b border-red-200 text-red-800 text-xs flex justify-between items-center">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="font-bold">&times;</button>
        </div>
      )}

      {/* Main workspace: ReactFlow canvas + Node Editor Sidebar */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* ReactFlow Canvas */}
        <div className="flex-1 h-full bg-slate-50">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background color="#cbd5e1" gap={16} />
            <Controls />
            <MiniMap nodeStrokeWidth={3} className="border border-gray-200 rounded-lg shadow-sm" />
          </ReactFlow>
        </div>

        {/* Selected Node / Option Editor Sidebar */}
        <div className="w-96 border-l border-gray-200 bg-white p-5 overflow-y-auto shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
            <h2 className="text-sm font-bold text-gray-900">
              {selectedNode
                ? `Node ${selectedNode.node_index + 1} Editor`
                : "Case Properties"}
            </h2>
            {!isEditable && (
              <span className="text-[10px] text-gray-500 uppercase font-semibold">
                Read-Only ({caseData.status})
              </span>
            )}
          </div>

          {selectedNode ? (
            <div className="space-y-5">
              {/* Situation text */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Situation / Scenario
                </label>
                <textarea
                  rows={4}
                  value={selectedNode.situation}
                  disabled={!isEditable}
                  onChange={(e) => {
                    const updated = { ...selectedNode, situation: e.target.value };
                    setSelectedNode(updated);
                    setCaseData({
                      ...caseData,
                      nodes: caseData.nodes.map((n) => (n.id === updated.id ? updated : n)),
                    });
                  }}
                  className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50"
                />
              </div>

              {/* Options list */}
              <div>
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Decision Options ({selectedNode.options.length})
                </h3>
                {selectedNode.options.length === 0 ? (
                  <p className="text-xs text-rose-600 italic">
                    Terminal Node — no branching options. Represents an outcome of the case.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {selectedNode.options.map((opt, idx) => (
                      <div
                        key={opt.id || idx}
                        className="p-3 border border-gray-200 rounded-lg bg-gray-50/50 space-y-2 text-xs"
                      >
                        <div className="flex justify-between items-center text-gray-500 font-semibold text-[11px]">
                          <span>Option {idx + 1}</span>
                          <span className="text-blue-600 font-mono text-[10px]">
                            {opt.next_node_id
                              ? `Next -> Node ${
                                  (caseData.nodes.find((n) => n.id === opt.next_node_id)
                                    ?.node_index ?? 0) + 1
                                }`
                              : "Terminal -> End"}
                          </span>
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-0.5">Choice Text</label>
                          <input
                            type="text"
                            value={opt.option_text}
                            disabled={!isEditable}
                            onChange={(e) => {
                              const newOpts = [...selectedNode.options];
                              newOpts[idx] = { ...newOpts[idx], option_text: e.target.value };
                              const updatedNode = { ...selectedNode, options: newOpts };
                              setSelectedNode(updatedNode);
                              setCaseData({
                                ...caseData,
                                nodes: caseData.nodes.map((n) =>
                                  n.id === updatedNode.id ? updatedNode : n
                                ),
                              });
                            }}
                            className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white disabled:bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-0.5">
                            Consequence (Revealed in Journey Review)
                          </label>
                          <textarea
                            rows={2}
                            value={opt.consequence}
                            disabled={!isEditable}
                            onChange={(e) => {
                              const newOpts = [...selectedNode.options];
                              newOpts[idx] = { ...newOpts[idx], consequence: e.target.value };
                              const updatedNode = { ...selectedNode, options: newOpts };
                              setSelectedNode(updatedNode);
                              setCaseData({
                                ...caseData,
                                nodes: caseData.nodes.map((n) =>
                                  n.id === updatedNode.id ? updatedNode : n
                                ),
                              });
                            }}
                            className="w-full text-xs p-1.5 border border-gray-300 rounded bg-white disabled:bg-gray-50"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">Select a node from the canvas to edit.</p>
          )}
        </div>
      </div>
    </div>
  );
}
