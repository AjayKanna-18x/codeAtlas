import { useNavigate } from "react-router-dom";
import { FiHome, FiArrowLeft } from "react-icons/fi";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-code">404</div>
        <div className="not-found-title">Page Not Found</div>
        <div className="not-found-subtitle">
          The page you are looking for does not exist or has been moved.
        </div>
        <div className="not-found-actions">
          <button
            className="btn-secondary"
            onClick={() => navigate(-1)}
          >
            <FiArrowLeft /> Go Back
          </button>
          <button
            className="btn-primary"
            onClick={() => navigate("/")}
          >
            <FiHome /> Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;