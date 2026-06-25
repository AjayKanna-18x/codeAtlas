import { memo } from "react";
import { Handle, Position } from "reactflow";

const typeConfig = {
  controller: { bg: "#eff6ff", border: "#2563eb", badge: "#2563eb", badgeBg: "#dbeafe" },
  service: { bg: "#f0fdf4", border: "#16a34a", badge: "#16a34a", badgeBg: "#dcfce7" },
  model: { bg: "#fef2f2", border: "#dc2626", badge: "#dc2626", badgeBg: "#fee2e2" },
  route: { bg: "#f5f3ff", border: "#7c3aed", badge: "#7c3aed", badgeBg: "#ede9fe" },
  middleware: { bg: "#fefce8", border: "#ca8a04", badge: "#ca8a04", badgeBg: "#fef9c3" },
  util: { bg: "#ecfeff", border: "#0891b2", badge: "#0891b2", badgeBg: "#cffafe" },
  config: { bg: "#fff7ed", border: "#e8590c", badge: "#e8590c", badgeBg: "#ffedd5" },
  test: { bg: "#fff7ed", border: "#ea580c", badge: "#ea580c", badgeBg: "#ffedd5" },
  unknown: { bg: "#f8fafc", border: "#94a3b8", badge: "#64748b", badgeBg: "#f1f5f9" },
};

const CustomNode = memo(({ data, selected }) => {
  const type = data.type || "unknown";
  const colors = typeConfig[type] || typeConfig.unknown;
  const isDeadCode = data.isDeadCode || false;

  return (
    <div
      style={{
        background: isDeadCode ? "#fef2f2" : colors.bg,
        border: `2px solid ${
          isDeadCode ? "#dc2626" : selected ? colors.border : "#e2e8f0"
        }`,
        borderRadius: "12px",
        padding: "12px 16px",
        minWidth: "150px",
        maxWidth: "220px",
        cursor: "grab",
        boxShadow: selected
          ? `0 0 0 3px ${colors.border}20, 0 4px 12px rgba(0,0,0,0.08)`
          : "0 2px 8px rgba(0,0,0,0.04)",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Top Handle */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: isDeadCode ? "#dc2626" : colors.border,
          width: 8,
          height: 8,
          border: "2px solid #ffffff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      />

      {/* Content */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {/* File name */}
        <div
          style={{
            fontSize: "12px",
            fontWeight: "700",
            color: "#0f172a",
            wordBreak: "break-all",
            lineHeight: "1.4",
            letterSpacing: "-0.01em",
          }}
        >
          {data.label}
        </div>

        {/* Badges */}
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: "9px",
              fontWeight: "700",
              padding: "2px 8px",
              borderRadius: "999px",
              background: colors.badgeBg,
              color: colors.badge,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {type}
          </span>
          {isDeadCode && (
            <span
              style={{
                fontSize: "9px",
                fontWeight: "700",
                padding: "2px 8px",
                borderRadius: "999px",
                background: "#fee2e2",
                color: "#dc2626",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              unused
            </span>
          )}
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            fontSize: "10px",
            color: "#94a3b8",
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: "500",
          }}
        >
          <span>{data.linesOfCode || 0} lines</span>
          <span>{data.functionCount || 0} fn</span>
          <span>{data.importCount || 0} imp</span>
        </div>
      </div>

      {/* Bottom Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: isDeadCode ? "#dc2626" : colors.border,
          width: 8,
          height: 8,
          border: "2px solid #ffffff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      />
    </div>
  );
});

CustomNode.displayName = "CustomNode";

export default CustomNode;