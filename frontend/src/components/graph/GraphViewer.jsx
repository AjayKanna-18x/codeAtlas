import { useCallback, useEffect, useMemo } from "react";
import ReactFlow, {
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import CustomNode from "./CustomNode";
import GraphControls from "./GraphControls";
import NodeInfoPanel from "./NodeInfoPanel";

// Register custom node types
const nodeTypes = {
  default: CustomNode,
};

// ─── Auto Layout — Spread nodes evenly ────────────────────
const getLayoutedNodes = (nodes) => {
  if (!nodes || nodes.length === 0) return [];

  const cols = Math.ceil(Math.sqrt(nodes.length));
  const spacingX = 280;
  const spacingY = 180;

  return nodes.map((node, index) => ({
    ...node,
    position: {
      x: (index % cols) * spacingX + Math.random() * 20,
      y: Math.floor(index / cols) * spacingY + Math.random() * 20,
    },
  }));
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
  // Apply layout to nodes
  const layoutedNodes = useMemo(
    () => getLayoutedNodes(initialNodes || []),
    [initialNodes]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges || []);

  // Update nodes/edges when props change
  useEffect(() => {
    const newLayouted = getLayoutedNodes(initialNodes || []);
    setNodes(newLayouted);
    setEdges(initialEdges || []);
  }, [initialNodes, initialEdges]);

  // Handle node click
  const handleNodeClick = useCallback(
    (event, node) => {
      onNodeClick && onNodeClick(node);
    },
    [onNodeClick]
  );

  // Handle pane click — close panel
  const handlePaneClick = useCallback(() => {
    onClosePanel && onClosePanel();
  }, [onClosePanel]);

  // Smooth edge options
  const defaultEdgeOptions = useMemo(
    () => ({
      type: "smoothstep",
      animated: false,
      style: {
        stroke: "#cbd5e1",
        strokeWidth: 1.5,
        opacity: 0.6,
      },
      markerEnd: {
        type: "arrowclosed",
        color: "#cbd5e1",
        width: 15,
        height: 15,
      },
    }),
    []
  );

  // Fit view options
  const fitViewOptions = useMemo(
    () => ({
      padding: 0.15,
      duration: 800,
    }),
    []
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
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={fitViewOptions}

        /* ── Smooth Controls ── */
        minZoom={0.05}
        maxZoom={3}
        snapToGrid={true}
        snapGrid={[15, 15]}
        panOnScroll={true}
        panOnScrollSpeed={0.8}
        zoomOnScroll={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={true}
        selectionOnDrag={false}
        panOnDrag={true}
        preventScrolling={true}

        /* ── Smooth Transitions ── */
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}

        /* ── Pro Options ── */
        proOptions={{ hideAttribution: true }}
      >
        {/* Zoom Controls */}
        <GraphControls onRefresh={onRefresh} />

        {/* Minimap */}
        <MiniMap
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          }}
          nodeColor={(node) => {
            if (node.data?.isDeadCode) return "#dc2626";
            const colors = {
              controller: "#2563eb",
              service: "#16a34a",
              model: "#dc2626",
              route: "#7c3aed",
              middleware: "#ca8a04",
              util: "#0891b2",
              config: "#e8590c",
              test: "#ea580c",
            };
            return colors[node.data?.type] || "#94a3b8";
          }}
          maskColor="rgba(248, 250, 252, 0.7)"
          pannable={true}
          zoomable={true}
          position="bottom-right"
        />

        {/* Background Grid */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={25}
          size={1}
          color="#e2e8f0"
        />

        {/* Node Count Badge */}
        <Panel position="bottom-left">
          <div className="graph-node-count">
            {nodes.length} files · {edges.length} dependencies
          </div>
        </Panel>
      </ReactFlow>

      {/* Node Info Panel */}
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