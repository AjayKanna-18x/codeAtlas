import { useCallback, useEffect } from "react";
import ReactFlow, {
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import CustomNode from "./CustomNode";
import GraphControls from "./GraphControls";
import NodeInfoPanel from "./NodeInfoPanel";

// Register custom node types
const nodeTypes = {
  default: CustomNode,
};

// ─── Inner Graph Component ────────────────────────────────
const GraphViewerInner = ({
  nodes: initialNodes,
  edges: initialEdges,
  onNodeClick,
  nodeDetails,
  onClosePanel,
  onRefresh,
  loading,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges || []);

  // Update nodes/edges when props change
  useEffect(() => {
    setNodes(initialNodes || []);
    setEdges(initialEdges || []);
  }, [initialNodes, initialEdges]);

  // Handle node click
  const handleNodeClick = useCallback(
    (event, node) => {
      onNodeClick && onNodeClick(node);
    },
    [onNodeClick]
  );

  if (loading) {
    return (
      <div className="graph-loading">
        <div className="loader" />
        <p>Loading dependency graph...</p>
      </div>
    );
  }

  if (!nodes || nodes.length === 0) {
    return (
      <div className="graph-empty">
        <div className="empty-state-icon">📊</div>
        <div className="empty-state-title">No Graph Data</div>
        <div className="empty-state-subtitle">
          Analyze the repository first to generate the dependency graph.
        </div>
      </div>
    );
  }

  return (
    <div className="graph-viewer-container">
      {/* ── React Flow Canvas ── */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: "smoothstep",
          style: { stroke: "#475569", strokeWidth: 1.5 },
          markerEnd: { type: "arrowclosed", color: "#475569" },
        }}
      >
        {/* Controls */}
        <GraphControls onRefresh={onRefresh} />

        {/* Minimap */}
        <MiniMap
          style={{
            background: "#0f172a",
            border: "1px solid #334155",
            borderRadius: "8px",
          }}
          nodeColor={(node) => {
            if (node.data?.isDeadCode) return "#ef4444";
            const colors = {
              controller: "#3b82f6",
              service: "#22c55e",
              model: "#ef4444",
              route: "#a855f7",
              middleware: "#eab308",
              util: "#06b6d4",
              config: "#6366f1",
            };
            return colors[node.data?.type] || "#475569";
          }}
          maskColor="rgba(15, 23, 42, 0.7)"
        />

        {/* Background Grid */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#1e293b"
        />
      </ReactFlow>

      {/* ── Node Info Panel ── */}
      {nodeDetails && (
        <NodeInfoPanel
          nodeDetails={nodeDetails}
          onClose={onClosePanel}
        />
      )}
    </div>
  );
};

// ─── Wrapper with ReactFlowProvider ──────────────────────
const GraphViewer = (props) => {
  return (
    <ReactFlowProvider>
      <GraphViewerInner {...props} />
    </ReactFlowProvider>
  );
};

export default GraphViewer;