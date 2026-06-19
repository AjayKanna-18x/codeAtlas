import { FiCode } from "react-icons/fi";

const Navbar = () => {
  return (
    <nav className="w-full bg-secondary px-6 py-4 flex items-center justify-between border-b border-slate-700">
      <div className="flex items-center gap-3">
        <FiCode className="text-accent text-2xl" />
        <span className="text-xl font-bold text-white tracking-wide">
          Code<span className="text-accent">Atlas</span>
        </span>
      </div>
      <div className="text-sm text-slate-400">
        Intelligent Codebase Exploration Platform
      </div>
    </nav>
  );
};

export default Navbar;