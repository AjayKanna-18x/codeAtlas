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

export const importRepository = (repoUrl) =>
  API.post("/repositories/import", { repoUrl });

export default API;