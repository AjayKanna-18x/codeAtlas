import { FiCode } from "react-icons/fi";

const LoadingScreen = ({ message = "Loading CodeAtlas..." }) => {
  return (
    <div className="loading-screen">
      <div className="loading-screen-content">
        <div className="loading-logo">
          <FiCode className="loading-logo-icon" />
          <span>
            Code<span>Atlas</span>
          </span>
        </div>
        <div className="loading-bar">
          <div className="loading-bar-fill" />
        </div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;