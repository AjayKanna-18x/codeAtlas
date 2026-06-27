import simpleGit from "simple-git";
import path from "path";
import fs from "fs";
import { isJavaScriptFile } from "../utils/fileUtils.js";

// ─── Get Commit History ───────────────────────────────────
export const getCommitHistory = async (repoPath, maxCount = 50) => {
  try {
    const git = simpleGit(repoPath);

    const log = await git.log({
      maxCount,
      "--stat": null,
    });

    const commits = log.all.map((commit) => ({
      hash: commit.hash.substring(0, 7),
      fullHash: commit.hash,
      message: commit.message,
      author: commit.author_name,
      email: commit.author_email,
      date: commit.date,
      timestamp: new Date(commit.date).getTime(),
    }));

    console.log(`📜 Found ${commits.length} commits`);
    return commits;
  } catch (error) {
    console.error(`❌ Git history error: ${error.message}`);
    throw new Error(`Failed to get commit history: ${error.message}`);
  }
};

// ─── Get Files Changed in a Commit ───────────────────────
export const getCommitChanges = async (repoPath, commitHash) => {
  try {
    const git = simpleGit(repoPath);

    const diff = await git.diffSummary([
      `${commitHash}~1`,
      commitHash,
    ]);

    const changes = diff.files
      .filter((file) => isJavaScriptFile(file.file))
      .map((file) => ({
        file: file.file,
        insertions: file.insertions,
        deletions: file.deletions,
        changes: file.changes,
        binary: file.binary,
      }));

    return changes;
  } catch (error) {
    // First commit — no parent to diff
    if (error.message.includes("unknown revision")) {
      const git = simpleGit(repoPath);
      const show = await git.show([
        commitHash,
        "--stat",
        "--name-only",
      ]);

      const files = show
        .split("\n")
        .filter((line) => line.trim() && isJavaScriptFile(line.trim()))
        .map((file) => ({
          file: file.trim(),
          insertions: 0,
          deletions: 0,
          changes: 0,
          binary: false,
        }));

      return files;
    }
    return [];
  }
};

// ─── Build Evolution Timeline ─────────────────────────────
export const buildEvolutionTimeline = async (repoPath, maxCount = 30) => {
  console.log(`📊 Building evolution timeline...`);

  const commits = await getCommitHistory(repoPath, maxCount);
  const timeline = [];

  for (const commit of commits) {
    try {
      const changes = await getCommitChanges(repoPath, commit.fullHash);

      const totalAdded = changes.reduce(
        (sum, c) => sum + (c.insertions || 0),
        0
      );
      const totalDeleted = changes.reduce(
        (sum, c) => sum + (c.deletions || 0),
        0
      );

      timeline.push({
        ...commit,
        filesChanged: changes.length,
        linesAdded: totalAdded,
        linesDeleted: totalDeleted,
        netChange: totalAdded - totalDeleted,
        files: changes.slice(0, 10),
      });
    } catch (error) {
      timeline.push({
        ...commit,
        filesChanged: 0,
        linesAdded: 0,
        linesDeleted: 0,
        netChange: 0,
        files: [],
      });
    }
  }

  console.log(`✅ Timeline built: ${timeline.length} commits`);
  return timeline;
};

// ─── Get File History ─────────────────────────────────────
export const getFileHistory = async (repoPath, filePath) => {
  try {
    const git = simpleGit(repoPath);

    const log = await git.log({
      file: filePath,
      maxCount: 20,
    });

    return log.all.map((commit) => ({
      hash: commit.hash.substring(0, 7),
      message: commit.message,
      author: commit.author_name,
      date: commit.date,
    }));
  } catch (error) {
    return [];
  }
};

// ─── Get Evolution Stats ──────────────────────────────────
export const getEvolutionStats = async (repoPath) => {
  const commits = await getCommitHistory(repoPath, 100);

  if (commits.length === 0) {
    return {
      totalCommits: 0,
      firstCommit: null,
      lastCommit: null,
      totalDays: 0,
      avgCommitsPerDay: 0,
      topContributors: [],
    };
  }

  // Count contributors
  const contributorMap = {};
  commits.forEach((c) => {
    contributorMap[c.author] = (contributorMap[c.author] || 0) + 1;
  });

  const topContributors = Object.entries(contributorMap)
    .map(([name, count]) => ({ name, commits: count }))
    .sort((a, b) => b.commits - a.commits)
    .slice(0, 5);

  // Calculate days
  const firstDate = new Date(commits[commits.length - 1].date);
  const lastDate = new Date(commits[0].date);
  const totalDays = Math.max(
    1,
    Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24))
  );

  return {
    totalCommits: commits.length,
    firstCommit: commits[commits.length - 1].date,
    lastCommit: commits[0].date,
    totalDays,
    avgCommitsPerDay: (commits.length / totalDays).toFixed(1),
    topContributors,
  };
};