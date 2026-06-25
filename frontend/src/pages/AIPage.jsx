import { useState, useEffect, useRef } from "react";
import {
  FiCpu,
  FiSend,
  FiTrash2,
  FiFile,
  FiLayers,
  FiActivity,
  FiBook,
  FiChevronDown,
} from "react-icons/fi";
import useRepository from "../hooks/useRepository";
import useAI from "../hooks/useAI";
import ChatMessage from "../components/ai/ChatMessage";
import FileSelector from "../components/ai/FileSelector";
import ArchitecturePanel from "../components/ai/ArchitecturePanel";
import PageHeader from "../components/common/PageHeader";
import { getFilesByRepo } from "../services/apiService";
import toast from "react-hot-toast";

const AIPage = () => {
  const { repositories } = useRepository();
  const {
    loading,
    messages,
    architectureData,
    getFileSummary,
    getModuleExplanation,
    getArchitecture,
    askQuestion,
    getProjectSummary,
    clearChat,
  } = useAI();

  const [selectedRepoId, setSelectedRepoId] = useState("");
  const [question, setQuestion] = useState("");
  const [files, setFiles] = useState([]);
  const [showFileSelector, setShowFileSelector] = useState(false);
  const [fileSelectorMode, setFileSelectorMode] = useState("summary");
  const [activeTab, setActiveTab] = useState("chat");
  const messagesEndRef = useRef(null);

  // ── Auto scroll to bottom ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Fetch files when repo selected ──
  useEffect(() => {
    if (selectedRepoId) {
      fetchFiles();
    }
  }, [selectedRepoId]);

  const fetchFiles = async () => {
    try {
      const res = await getFilesByRepo(selectedRepoId);
      setFiles(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch files:", error);
    }
  };

  // ── Handle question submit ──
  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    if (!selectedRepoId) {
      toast.error("Please select a repository first.");
      return;
    }
    const q = question;
    setQuestion("");
    await askQuestion(q, selectedRepoId);
  };

  // ── Handle key press ──
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  // ── Handle file select ──
  const handleFileSelect = async (file) => {
    if (fileSelectorMode === "summary") {
      await getFileSummary(file._id, file.fileName);
    } else if (fileSelectorMode === "module") {
      await getModuleExplanation(
        file._id,
        selectedRepoId,
        file.fileName
      );
    }
  };

  // ── Quick action buttons ──
  const quickActions = [
    {
      label: "File Summary",
      icon: <FiFile />,
      onClick: () => {
        if (!selectedRepoId) {
          toast.error("Select a repository first.");
          return;
        }
        setFileSelectorMode("summary");
        setShowFileSelector(true);
      },
      color: "#6366f1",
    },
    {
      label: "Module Explain",
      icon: <FiBook />,
      onClick: () => {
        if (!selectedRepoId) {
          toast.error("Select a repository first.");
          return;
        }
        setFileSelectorMode("module");
        setShowFileSelector(true);
      },
      color: "#22c55e",
    },
    {
      label: "Architecture",
      icon: <FiLayers />,
      onClick: async () => {
        if (!selectedRepoId) {
          toast.error("Select a repository first.");
          return;
        }
        setActiveTab("architecture");
        await getArchitecture(selectedRepoId);
      },
      color: "#06b6d4",
    },
    {
      label: "Project Summary",
      icon: <FiActivity />,
      onClick: async () => {
        if (!selectedRepoId) {
          toast.error("Select a repository first.");
          return;
        }
        await getProjectSummary(selectedRepoId);
      },
      color: "#a855f7",
    },
  ];

  return (
    <div className="ai-page">

      {/* ── Header ── */}
      <PageHeader
        title="AI Code"
        highlight="Assistant"
        subtitle="AI-powered code explanations and architecture analysis."
        actions={
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <select
              className="repo-selector"
              value={selectedRepoId}
              onChange={(e) => {
                setSelectedRepoId(e.target.value);
                clearChat();
              }}
            >
              <option value="">Select Repository</option>
              {repositories.map((repo) => (
                <option key={repo._id} value={repo._id}>
                  {repo.owner}/{repo.name}
                </option>
              ))}
            </select>
            <button
              className="btn-secondary"
              onClick={clearChat}
              title="Clear chat"
            >
              <FiTrash2 /> Clear
            </button>
          </div>
        }
      />

      {/* ── Tabs ── */}
      <div className="ai-tabs">
        <button
          className={`ai-tab ${activeTab === "chat" ? "active" : ""}`}
          onClick={() => setActiveTab("chat")}
        >
          <FiCpu /> Chat Assistant
        </button>
        <button
          className={`ai-tab ${
            activeTab === "architecture" ? "active" : ""
          }`}
          onClick={() => setActiveTab("architecture")}
        >
          <FiLayers /> Architecture Panel
        </button>
      </div>

      {/* ── No Repo Selected ── */}
      {!selectedRepoId && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FiCpu />
          </div>
          <div className="empty-state-title">
            Select a Repository
          </div>
          <div className="empty-state-subtitle">
            Choose a repository to start using the AI assistant.
          </div>
        </div>
      )}

      {/* ── Chat Tab ── */}
      {selectedRepoId && activeTab === "chat" && (
        <div className="ai-chat-wrapper">

          {/* Quick Actions */}
          <div className="ai-quick-actions">
            {quickActions.map((action, i) => (
              <button
                key={i}
                className="ai-quick-btn"
                onClick={action.onClick}
                disabled={loading}
                style={{ "--action-color": action.color }}
              >
                <span style={{ color: action.color }}>
                  {action.icon}
                </span>
                {action.label}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="ai-messages">
            {messages.length === 0 ? (
              <div className="ai-welcome">
                <div className="ai-welcome-icon">
                  <FiCpu />
                </div>
                <div className="ai-welcome-title">
                  CodeAtlas AI Assistant
                </div>
                <div className="ai-welcome-subtitle">
                  Ask me anything about your codebase. I can explain
                  files, analyze architecture, detect patterns, and
                  answer questions about your JavaScript project.
                </div>
                <div className="ai-suggestions">
                  {[
                    "What does this project do?",
                    "Which file is the entry point?",
                    "Explain the authentication flow",
                    "What are the main modules?",
                  ].map((suggestion, i) => (
                    <button
                      key={i}
                      className="ai-suggestion-chip"
                      onClick={() => {
                        setQuestion(suggestion);
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))
            )}

            {/* Loading indicator */}
            {loading && (
              <div className="ai-thinking">
                <div className="ai-thinking-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <span>AI is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="ai-input-area">
            <textarea
              className="ai-input"
              placeholder="Ask anything about your codebase... (Press Enter to send)"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyPress}
              rows={2}
              disabled={loading}
            />
            <button
              className="ai-send-btn"
              onClick={handleAskQuestion}
              disabled={loading || !question.trim()}
            >
              <FiSend />
            </button>
          </div>
        </div>
      )}

      {/* ── Architecture Tab ── */}
      {selectedRepoId && activeTab === "architecture" && (
        <div className="ai-architecture-wrapper">
          {!architectureData ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <FiLayers />
              </div>
              <div className="empty-state-title">
                No Architecture Data
              </div>
              <div className="empty-state-subtitle">
                Click the Architecture button to analyze your project
                structure.
              </div>
              <button
                className="btn-primary"
                onClick={() => getArchitecture(selectedRepoId)}
                disabled={loading}
              >
                <FiLayers />
                {loading ? "Analyzing..." : "Analyze Architecture"}
              </button>
            </div>
          ) : (
            <ArchitecturePanel data={architectureData} />
          )}
        </div>
      )}

      {/* ── File Selector Modal ── */}
      {showFileSelector && (
        <FileSelector
          files={files}
          onSelect={handleFileSelect}
          onClose={() => setShowFileSelector(false)}
        />
      )}
    </div>
  );
};

export default AIPage;