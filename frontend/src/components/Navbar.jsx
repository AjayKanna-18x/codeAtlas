import { FiCode } from "react-icons/fi";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <FiCode className="sidebar-icon" />
        <span>Code<span>Atlas</span></span>
      </div>
      <div className="navbar-subtitle">
        Intelligent Codebase Exploration Platform
      </div>
    </nav>
  );
};

export default Navbar;