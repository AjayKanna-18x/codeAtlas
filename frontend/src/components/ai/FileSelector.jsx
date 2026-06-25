import { useState } from "react";
import { FiSearch, FiFile, FiX } from "react-icons/fi";

const FileSelector = ({ files, onSelect, onClose }) => {
  const [search, setSearch] = useState("");

  const filtered = files.filter((f) =>
    f.fileName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="file-selector-overlay">
      <div className="file-selector-modal">
        {/* Header */}
        <div className="file-selector-header">
          <span>Select a File</span>
          <button className="file-selector-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* Search */}
        <div className="file-selector-search">
          <FiSearch className="file-search-icon" />
          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="file-search-input"
            autoFocus
          />
        </div>

        {/* File List */}
        <div className="file-selector-list">
          {filtered.length === 0 ? (
            <div className="file-selector-empty">No files found.</div>
          ) : (
            filtered.slice(0, 50).map((file) => (
              <div
                key={file._id}
                className="file-selector-item"
                onClick={() => {
                  onSelect(file);
                  onClose();
                }}
              >
                <FiFile style={{ color: "#6366f1", flexShrink: 0 }} />
                <div>
                  <div className="file-selector-name">
                    {file.fileName}
                  </div>
                  <div className="file-selector-path">
                    {file.relativePath}
                  </div>
                </div>
                <div className="file-selector-stats">
                  <span>{file.stats?.linesOfCode || 0}L</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FileSelector;