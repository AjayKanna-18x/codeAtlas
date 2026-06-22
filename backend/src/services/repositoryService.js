// ─── Repository Service ───────────────────────────────────
// Handles GitHub URL cloning and local repo management
// Full implementation → Day 10 (Clone repository locally)

export const validateGithubUrl = (url) => {
  const pattern =
    /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;
  return pattern.test(url);
};

export const extractRepoName = (url) => {
  const parts = url.split("/");
  return parts[parts.length - 1];
};

export const extractRepoOwner = (url) => {
  const parts = url.split("/");
  return parts[parts.length - 2];
};