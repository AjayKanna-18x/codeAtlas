export const validateRepoUrl = (req, res, next) => {
  const { repoUrl } = req.body;

  if (!repoUrl) {
    res.status(400);
    throw new Error("Repository URL is required.");
  }

  const githubUrlPattern =
    /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;

  if (!githubUrlPattern.test(repoUrl)) {
    res.status(400);
    throw new Error("Invalid GitHub repository URL format.");
  }

  next();
};