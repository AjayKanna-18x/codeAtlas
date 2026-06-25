import { FiCpu, FiUser, FiCopy, FiCheck } from "react-icons/fi";
import { useState } from "react";

const ChatMessage = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";
  const isError = message.type === "error";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format message content with markdown-like styling
  const formatContent = (content) => {
    return content
      .split("\n")
      .map((line, i) => {
        if (line.startsWith("**") && line.endsWith("**")) {
          return (
            <strong key={i} style={{ color: "#e2e8f0" }}>
              {line.replace(/\*\*/g, "")}
            </strong>
          );
        }
        if (line.startsWith("•")) {
          return (
            <div key={i} className="ai-bullet">
              {line}
            </div>
          );
        }
        if (line === "") {
          return <br key={i} />;
        }
        return <span key={i}>{line}</span>;
      });
  };

  return (
    <div className={`chat-message ${isUser ? "user" : "assistant"}`}>
      {/* ── Avatar ── */}
      <div className={`chat-avatar ${isUser ? "user" : "assistant"}`}>
        {isUser ? <FiUser /> : <FiCpu />}
      </div>

      {/* ── Content ── */}
      <div
        className={`chat-bubble ${isUser ? "user" : "assistant"} ${
          isError ? "error" : ""
        }`}
      >
        <div className="chat-content">
          {formatContent(message.content)}
        </div>

        {/* ── Footer ── */}
        <div className="chat-footer">
          <span className="chat-time">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
          {!isUser && (
            <button
              className="chat-copy-btn"
              onClick={handleCopy}
              title="Copy message"
            >
              {copied ? <FiCheck /> : <FiCopy />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;