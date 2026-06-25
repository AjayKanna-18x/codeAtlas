import { useState, useCallback } from "react";
import {
  getAIFileSummary,
  getAIModuleExplanation,
  getAIArchitecture,
  askAIQuestion,
  getAIProjectSummary,
} from "../services/apiService";
import toast from "react-hot-toast";

const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [architectureData, setArchitectureData] = useState(null);
  const [projectSummary, setProjectSummary] = useState(null);

  // ── Add message to chat ──
  const addMessage = (role, content, extra = {}) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role,
        content,
        timestamp: new Date().toISOString(),
        ...extra,
      },
    ]);
  };

  // ── Get file summary ──
  const getFileSummary = useCallback(async (fileId, fileName) => {
    setLoading(true);
    addMessage("user", `Explain the file: ${fileName}`);

    try {
      const res = await getAIFileSummary(fileId);
      const summary = res.data.data.summary;
      addMessage("assistant", summary, { type: "file-summary" });
      return summary;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "Failed to generate file summary.";
      addMessage("assistant", `❌ Error: ${msg}`, { type: "error" });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Get module explanation ──
  const getModuleExplanation = useCallback(
    async (fileId, repoId, fileName) => {
      setLoading(true);
      addMessage("user", `Explain module: ${fileName} and its connections`);

      try {
        const res = await getAIModuleExplanation(fileId, repoId);
        const explanation = res.data.data.explanation;
        addMessage("assistant", explanation, {
          type: "module-explanation",
        });
        return explanation;
      } catch (error) {
        const msg =
          error.response?.data?.message ||
          "Failed to generate module explanation.";
        addMessage("assistant", `❌ Error: ${msg}`, { type: "error" });
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ── Get architecture ──
  const getArchitecture = useCallback(async (repoId) => {
    setLoading(true);
    addMessage("user", "Analyze the overall architecture of this project");
    toast.loading("Analyzing architecture...", { id: "arch" });

    try {
      const res = await getAIArchitecture(repoId);
      const data = res.data.data;
      setArchitectureData(data);

      const message = `
**Architecture Pattern:** ${data.pattern}
**Confidence:** ${data.confidence}%

**Layers Detected:**
${data.layers?.map((l) => `• ${l}`).join("\n") || "None detected"}

**AI Analysis:**
${data.aiDescription || "Architecture analysis complete."}

**Suggestions:**
${data.suggestions?.map((s) => `• ${s}`).join("\n") || "No suggestions"}
      `.trim();

      addMessage("assistant", message, { type: "architecture" });
      toast.success("Architecture analyzed!", { id: "arch" });
      return data;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "Failed to analyze architecture.";
      addMessage("assistant", `❌ Error: ${msg}`, { type: "error" });
      toast.error(msg, { id: "arch" });
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Ask question ──
  const askQuestion = useCallback(async (question, repoId) => {
    if (!question.trim()) return;
    setLoading(true);
    addMessage("user", question);

    try {
      const res = await askAIQuestion(question, repoId);
      const answer = res.data.data.answer;
      addMessage("assistant", answer, { type: "answer" });
      return answer;
    } catch (error) {
      const msg =
        error.response?.data?.message || "Failed to answer question.";
      addMessage("assistant", `❌ Error: ${msg}`, { type: "error" });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Get project summary ──
  const getProjectSummary = useCallback(async (repoId) => {
    setLoading(true);
    addMessage("user", "Generate a complete project summary");
    toast.loading("Generating project summary...", { id: "summary" });

    try {
      const res = await getAIProjectSummary(repoId);
      const summary = res.data.data.summary;
      setProjectSummary(summary);
      addMessage("assistant", summary, { type: "project-summary" });
      toast.success("Summary generated!", { id: "summary" });
      return summary;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "Failed to generate project summary.";
      addMessage("assistant", `❌ Error: ${msg}`, { type: "error" });
      toast.error(msg, { id: "summary" });
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Clear chat ──
  const clearChat = useCallback(() => {
    setMessages([]);
    setArchitectureData(null);
    setProjectSummary(null);
  }, []);

  return {
    loading,
    messages,
    architectureData,
    projectSummary,
    getFileSummary,
    getModuleExplanation,
    getArchitecture,
    askQuestion,
    getProjectSummary,
    clearChat,
  };
};

export default useAI;