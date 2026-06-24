import { useState } from "react";
import {
  FiFolder,
  FiFolderMinus,
  FiFile,
  FiChevronRight,
  FiChevronDown,
} from "react-icons/fi";

// ─── File Tree Node ───────────────────────────────────────
const TreeNode = ({ node, onFileClick, selectedFile, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(depth < 2);

  if (node.type === "file") {
    const isSelected = selectedFile === node.path;
    return (
      <div
        className={`tree-file ${isSelected ? "selected" : ""}`}
        style={{ paddingLeft: `${(depth + 1) * 16}px` }}
        onClick={() => onFileClick && onFileClick(node)}
      >
        <FiFile className="tree-icon file-icon" />
        <span className="tree-name">{node.name}</span>
      </div>
    );
  }

  // Folder node
  return (
    <div className="tree-folder-wrapper">
      <div
        className="tree-folder"
        style={{ paddingLeft: `${depth * 16}px` }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="tree-chevron">
          {isOpen ? <FiChevronDown /> : <FiChevronRight />}
        </span>
        {isOpen ? (
          <FiFolderMinus className="tree-icon folder-open-icon" />
        ) : (
          <FiFolder className="tree-icon folder-icon" />
        )}
        <span className="tree-name folder-name">{node.name}</span>
        <span className="tree-count">
          {node.children?.length || 0}
        </span>
      </div>

      {isOpen && node.children && (
        <div className="tree-children">
          {node.children.map((child, i) => (
            <TreeNode
              key={i}
              node={child}
              onFileClick={onFileClick}
              selectedFile={selectedFile}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── File Tree Component ──────────────────────────────────
const FileTree = ({ hierarchy, onFileClick, selectedFile }) => {
  if (!hierarchy) {
    return (
      <div className="file-tree-empty">
        <FiFolder style={{ fontSize: "2rem", color: "#334155" }} />
        <p>No files discovered yet.</p>
      </div>
    );
  }

  return (
    <div className="file-tree">
      <TreeNode
        node={hierarchy}
        onFileClick={onFileClick}
        selectedFile={selectedFile}
        depth={0}
      />
    </div>
  );
};

export default FileTree;