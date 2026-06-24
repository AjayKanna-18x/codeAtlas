import axios from "axios";
import simpleGit from "simple-git";
import fs from "fs";
import path from "path";
import { config } from "../config/env.js";
import { v4 as uuidv4 } from "uuid";

// ─── Previous functions remain same ──────────────────────
export const validateGithubUrl = (url) => {
  const pattern =
    /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/;
  return pattern.test(url.trim());
};

export const extractRepoInfo = (url) => {
  const cleaned = url.trim().replace(/\/$/, "");
  const parts = cleaned.replace("https://github.com/", "").split("/");
  return {
    owner: parts[0] || null,
    name: parts[1] || null,
    fullName: `${parts[0]}/${parts[1]}` || null,
  };
};

export const checkGithubRepoExists = async (owner, name) => {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${name}`,
      {
        headers: { Accept: "application/vnd.github.v3+json" },
        timeout: 10000,
      }
    );
    const data = response.data;
    return {
      exists: true,
      isPrivate: data.private,
      repoData: {
        name: data.name,
        fullName: data.full_name,
        owner: data.owner.login,
        description: data.description,
        stars: data.stargazers_count,
        forks: data.forks_count,
        language: data.language,
        defaultBranch: data.default_branch,
        size: data.size,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        cloneUrl: data.clone_url,
        htmlUrl: data.html_url,
      },
    };
  } catch (error) {
    if (error.response?.status === 404) {
      return { exists: false, isPrivate: false, repoData: null,
        error: "Repository not found." };
    }
    if (error.response?.status === 403) {
      return { exists: false, isPrivate: true, repoData: null,
        error: "Private repository or rate limit exceeded." };
    }
    return { exists: false, isPrivate: false, repoData: null,
      error: error.message };
  }
};

export const validateRepository = async (url) => {
  if (!validateGithubUrl(url)) {
    return { valid: false, step: "url_format",
      message: "Invalid GitHub URL format.", data: null };
  }
  const { owner, name } = extractRepoInfo(url);
  if (!owner || !name) {
    return { valid: false, step: "url_parse",
      message: "Could not extract owner or name.", data: null };
  }
  const repoCheck = await checkGithubRepoExists(owner, name);
  if (!repoCheck.exists) {
    return { valid: false, step: "repo_exists",
      message: repoCheck.error, data: null };
  }
  if (repoCheck.isPrivate) {
    return { valid: false, step: "repo_access",
      message: "Private repositories not supported.", data: null };
  }
  return { valid: true, step: "completed",
    message: "Repository validated successfully.", data: repoCheck.repoData };
};

// ─── NEW: Clone Repository ────────────────────────────────
export const cloneRepository = async (cloneUrl, repoName) => {
  try {
    // Create unique folder name for this repo
    const uniqueId = uuidv4().split("-")[0];
    const folderName = `${repoName}-${uniqueId}`;
    const clonePath = path.join(config.reposPath, folderName);

    // Make sure repos folder exists
    if (!fs.existsSync(config.reposPath)) {
      fs.mkdirSync(config.reposPath, { recursive: true });
    }

    console.log(`📥 Cloning repository: ${cloneUrl}`);
    console.log(`📁 Destination: ${clonePath}`);

    // Initialize simple-git and clone
    const git = simpleGit();

    await git.clone(cloneUrl, clonePath, [
      "--depth", "1", // Shallow clone (faster)
    ]);

    console.log(`✅ Repository cloned successfully: ${folderName}`);

    return {
      success: true,
      clonePath,
      folderName,
      message: "Repository cloned successfully.",
    };

  } catch (error) {
    console.error(`❌ Clone failed: ${error.message}`);
    return {
      success: false,
      clonePath: null,
      folderName: null,
      message: `Clone failed: ${error.message}`,
    };
  }
};

// ─── NEW: Delete Cloned Repository ───────────────────────
export const deleteClonedRepo = (clonePath) => {
  try {
    if (fs.existsSync(clonePath)) {
      fs.rmSync(clonePath, { recursive: true, force: true });
      console.log(`🗑️ Deleted cloned repo: ${clonePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Delete failed: ${error.message}`);
    return false;
  }
};