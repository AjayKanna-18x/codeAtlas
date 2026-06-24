import { useReactFlow } from "reactflow";
import {
  FiZoomIn,
  FiZoomOut,
  FiMaximize,
  FiRefreshCw,
} from "react-icons/fi";

const GraphControls = ({ onRefresh }) => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div className="graph-controls">
      <button
        className="graph-control-btn"
        onClick={() => zoomIn()}
        title="Zoom In"
      >
        <FiZoomIn />
      </button>
      <button
        className="graph-control-btn"
        onClick={() => zoomOut()}
        title="Zoom Out"
      >
        <FiZoomOut />
      </button>
      <button
        className="graph-control-btn"
        onClick={() => fitView({ padding: 0.1 })}
        title="Fit View"
      >
        <FiMaximize />
      </button>
      <div className="graph-control-divider" />
      <button
        className="graph-control-btn"
        onClick={onRefresh}
        title="Refresh Graph"
      >
        <FiRefreshCw />
      </button>
    </div>
  );
};

export default GraphControls;