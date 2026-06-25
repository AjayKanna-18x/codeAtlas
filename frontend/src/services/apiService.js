import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Repository APIs ──────────────────────────────────────
export const validateRepository = (repoUrl) =>
  API.post("/repositories/validate", { repoUrl });

export const getAllRepositories = () =>
  API.get("/repositories");

export const getRepositoryById = (id) =>
  API.get(`/repositories/${id}`);

export const importRepository = (repoUrl) =>
  API.post("/repositories/import", { repoUrl });

export const analyzeRepository = (id) =>
  API.post(`/repositories/${id}/analyze`);

export const deleteRepository = (id) =>
  API.delete(`/repositories/${id}`);

// ─── Graph APIs ───────────────────────────────────────────
export const getDependencyGraph = (repoId, format = "reactflow") =>
  API.get(`/graph/${repoId}?format=${format}`);

export const getGraphStats = (repoId) =>
  API.get(`/graph/${repoId}/stats`);

export const getNodeDetails = (repoId, nodeId) =>
  API.get(`/graph/${repoId}/node/${encodeURIComponent(nodeId)}`);

// ─── File APIs ────────────────────────────────────────────
export const getFilesByRepo = (repoId, search = "") =>
  API.get(`/files/${repoId}${search ? `?search=${search}` : ""}`);

export const getFileById = (fileId) =>
  API.get(`/files/single/${fileId}`);

export const getFileStats = (repoId) =>
  API.get(`/files/${repoId}/stats`);

export const getDeadCodeFiles = (repoId) =>
  API.get(`/files/${repoId}/deadcode`);

// ─── Analysis APIs ────────────────────────────────────────
export const getAnalysisResult = (repoId) =>
  API.get(`/analysis/${repoId}`);

export const getAnalysisSummary = (repoId) =>
  API.get(`/analysis/${repoId}/summary`);

export const runDeadCodeDetection = (repoId) =>
  API.post(`/analysis/${repoId}/deadcode`);

// ─── AI APIs ──────────────────────────────────────────────
export const getAIFileSummary = (fileId) =>
  API.post("/ai/file-summary", { fileId });

export const getAIModuleExplanation = (fileId, repoId) =>
  API.post("/ai/module-explain", { fileId, repoId });

export const getAIArchitecture = (repoId) =>
  API.post("/ai/architecture", { repoId });

export const askAIQuestion = (question, repoId) =>
  API.post("/ai/question", { question, repoId });

export const getAIProjectSummary = (repoId) =>
  API.post("/ai/project-summary", { repoId });

export default API;