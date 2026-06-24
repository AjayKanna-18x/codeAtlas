import { memo } from "react";
import { Handle, Position } from "reactflow";

// ─── Node type colors ─────────────────────────────────────
const typeColors = {
  controller: { bg: "#1e3a5f", border: "#3b82f6", badge: "#3b82f6" },
  service: { bg: "#1a3a2a", border: "#22c55e", badge: "#22c55e" },
  model: { bg: "#3a1a1a", border: "#ef4444", badge: "#ef4444" },
  route: { bg: "#2a1a3a", border: "#a855f7", badge: "#a855f7" },
  middleware: { bg: "#3a3a1a", border: "#eab308", badge: "#eab308" },
  util: { bg: "#1a3a3a", border: "#06b6d4", badge: "#06b6d4" },
  config: { bg: "#2a2a3a", border: "#6366f1", badge: "#6366f1" },
  test: { bg: "#3a2a1a", border: "#f97316", badge: "#f97316" },
  unknown: { bg: "#1e293b", border: "#334155", badge: "#475569" },
};

const CustomNode = memo(({ data, selected }) => {
  const type = data.type || "unknown";
  const colors = typeColors[type] || typeColors.unknown;
  const isDeadCode = data.isDeadCode || false;

  const bgColor = isDeadCode ? "#3a0a0a" : colors.bg;
  const borderColor = isDeadCode ? "#ef4444" : selected ? "#ffffff" : colors.border;

  return (
    <div
      style={{
        background: bgColor,
        border: `2px solid ${borderColor}`,
        borderRadius: "10px",
        padding: "10px 14px",
        minWidth: "140px",
        maxWidth: "200px",
        cursor: "pointer",
        boxShadow: selected
          ? `0 0 0 2px ${borderColor}40`
          : "0 2px 8px rgba(0,0,0,0.3)",
        transition: "all 0.2s ease",
      }}
    >
      {/* ── Top handles ── */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: borderColor,
          width: 8,
          height: 8,
          border: "none",
        }}
      />

      {/* ── Node Content ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>

        {/* File name */}
        <div
          style={{
            fontSize: "11px",
            fontWeight: "700",
            color: "#ffffff",
            wordBreak: "break-all",
            lineHeight: "1.3",
            fontFamily: "Fira Code, monospace",
          }}
        >
          {data.label}
        </div>

        {/* Type badge */}
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: "9px",
              fontWeight: "600",
              padding: "2px 6px",
              borderRadius: "999px",
              background: `${colors.badge}25`,
              color: colors.badge,
              border: `1px solid ${colors.badge}50`,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {type}
          </span>
          {isDeadCode && (
            <span
              style={{
                fontSize: "9px",
                fontWeight: "600",
                padding: "2px 6px",
                borderRadius: "999px",
                background: "#ef444425",
                color: "#ef4444",
                border: "1px solid #ef444450",
                textTransform: "uppercase",
              }}
            >
              dead
            </span>
          )}
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            fontSize: "9px",
            color: "#64748b",
          }}
        >
          <span>📄 {data.linesOfCode || 0}L</span>
          <span>⚡ {data.functionCount || 0}F</span>
          <span>🔗 {data.importCount || 0}I</span>
        </div>
      </div>

      {/* ── Bottom handle ── */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: borderColor,
          width: 8,
          height: 8,
          border: "none",
        }}
      />
    </div>
  );
});

CustomNode.displayName = "CustomNode";

export default CustomNode;