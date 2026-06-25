import { useReactFlow } from "reactflow";
import {
  FiZoomIn,
  FiZoomOut,
  FiMaximize,
  FiRefreshCw,
  FiTarget,
} from "react-icons/fi";

const GraphControls = ({ onRefresh }) => {
  const { zoomIn, zoomOut, fitView, setCenter } = useReactFlow();

  const handleFitView = () => {
    fitView({
      padding: 0.15,
      duration: 800,
    });
  };

  const handleZoomIn = () => {
    zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    zoomOut({ duration: 300 });
  };

  const handleCenter = () => {
    setCenter(0, 0, { zoom: 0.8, duration: 800 });
  };

  return (
    <div className="graph-controls">
      <button
        className="graph-control-btn"
        onClick={handleZoomIn}
        title="Zoom In"
      >
        <FiZoomIn />
      </button>
      <button
        className="graph-control-btn"
        onClick={handleZoomOut}
        title="Zoom Out"
      >
        <FiZoomOut />
      </button>
      <button
        className="graph-control-btn"
        onClick={handleFitView}
        title="Fit View"
      >
        <FiMaximize />
      </button>
      <button
        className="graph-control-btn"
        onClick={handleCenter}
        title="Center View"
      >
        <FiTarget />
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