import axios from "axios";

// ─── Validate GitHub URL Format ───────────────────────────
export const validateGithubUrl = (url) => {
  const pattern =
    /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/;
  return pattern.test(url.trim());
};

// ─── Extract Repo Info from URL ───────────────────────────
export const extractRepoInfo = (url) => {
  const cleaned = url.trim().replace(/\/$/, "");
  const parts = cleaned.replace("https://github.com/", "").split("/");

  return {
    owner: parts[0] || null,
    name: parts[1] || null,
    fullName: `${parts[0]}/${parts[1]}` || null,
  };
};

// ─── Check if GitHub Repo Exists ─────────────────────────
export const checkGithubRepoExists = async (owner, name) => {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${name}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          // Add GitHub token here if needed for rate limits
          // Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
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
      return {
        exists: false,
        isPrivate: false,
        repoData: null,
        error: "Repository not found. Check the URL and try again.",
      };
    }

    if (error.response?.status === 403) {
      return {
        exists: false,
        isPrivate: true,
        repoData: null,
        error: "Repository is private or GitHub API rate limit exceeded.",
      };
    }

    return {
      exists: false,
      isPrivate: false,
      repoData: null,
      error: `GitHub API Error: ${error.message}`,
    };
  }
};

// ─── Full Validation Pipeline ─────────────────────────────
export const validateRepository = async (url) => {
  // Step 1 — Validate URL format
  if (!validateGithubUrl(url)) {
    return {
      valid: false,
      step: "url_format",
      message: "Invalid GitHub URL format.",
      data: null,
    };
  }

  // Step 2 — Extract repo info
  const { owner, name } = extractRepoInfo(url);

  if (!owner || !name) {
    return {
      valid: false,
      step: "url_parse",
      message: "Could not extract repository owner or name.",
      data: null,
    };
  }

  // Step 3 — Check if repo exists on GitHub
  const repoCheck = await checkGithubRepoExists(owner, name);

  if (!repoCheck.exists) {
    return {
      valid: false,
      step: "repo_exists",
      message: repoCheck.error || "Repository does not exist.",
      data: null,
    };
  }

  if (repoCheck.isPrivate) {
    return {
      valid: false,
      step: "repo_access",
      message: "Private repositories are not supported yet.",
      data: null,
    };
  }

  // Step 4 — All checks passed
  return {
    valid: true,
    step: "completed",
    message: "Repository validated successfully.",
    data: repoCheck.repoData,
  };
};