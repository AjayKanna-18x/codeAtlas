import { config } from "../config/env.js";
import { CohereClient } from "cohere-ai";

let cohereClient = null;

const getCohereClient = () => {
  if (!cohereClient) {
    cohereClient = new CohereClient({
      token: config.cohereApiKey,
    });
  }
  return cohereClient;
};

// ─── Call AI for Review ───────────────────────────────────
const callReviewAI = async (prompt) => {
  try {
    const client = getCohereClient();
    const response = await client.chat({
      model: "command-a-03-2025",
      message: prompt,
      temperature: 0.5,
      maxTokens: 800,
    });
    return response.text.trim();
  } catch (error) {
    console.error(`❌ Review AI Error: ${error.message}`);
    throw new Error(`AI review failed: ${error.message}`);
  }
};

// ─── Review Single File ──────────────────────────────────
export const reviewFile = async (fileData) => {
  const prompt = `You are a senior code reviewer performing a thorough code review.

Review this JavaScript file:

File: ${fileData.fileName}
Path: ${fileData.relativePath}
Lines: ${fileData.stats?.linesOfCode || 0}
Functions: ${fileData.stats?.functionCount || 0}
Imports: ${fileData.stats?.importCount || 0}
Exports: ${fileData.stats?.exportCount || 0}
Is Dead Code: ${fileData.isDeadCode ? "Yes" : "No"}

Imports used:
${
  fileData.imports?.length > 0
    ? fileData.imports.map((i) => `- ${i.source}`).join("\n")
    : "None"
}

Please provide a structured code review:

1. QUALITY SCORE (1-10): Give an overall quality score
2. STRENGTHS: List 2-3 positive aspects
3. ISSUES: List 2-3 potential issues or code smells
4. SUGGESTIONS: List 2-3 specific improvement suggestions
5. RISK LEVEL: Low / Medium / High
6. SUMMARY: One sentence summary

Be specific and actionable. Under 300 words.`;

  const review = await callReviewAI(prompt);
  return review;
};

// ─── Review Entire Project ────────────────────────────────
export const reviewProject = async (projectData, files) => {
  const fileList = files
    .slice(0, 25)
    .map(
      (f) =>
        `- ${f.relativePath} (${f.stats?.linesOfCode || 0} lines, ${
          f.stats?.functionCount || 0
        } functions, dead: ${f.isDeadCode ? "yes" : "no"})`
    )
    .join("\n");

  const prompt = `You are a senior software architect performing a comprehensive project review.

Review this JavaScript project:

Project: ${projectData.name} by ${projectData.owner}
Description: ${projectData.description || "No description"}
Total Files: ${projectData.stats?.totalFiles || 0}
JS Files: ${projectData.stats?.jsFiles || 0}
Total Lines: ${projectData.stats?.totalLines || 0}
Dependencies: ${projectData.stats?.totalDependencies || 0}
Dead Code Files: ${projectData.stats?.deadCodeFiles || 0}

Files in project:
${fileList}

Please provide a comprehensive review:

1. PROJECT SCORE (1-100): Overall project quality score
2. CODE ORGANIZATION: How well is the code organized? (1-10)
3. ARCHITECTURE: Architecture quality assessment (1-10)
4. MAINTAINABILITY: How maintainable is this codebase? (1-10)
5. TOP ISSUES: List 3-5 most critical issues
6. RECOMMENDATIONS: List 3-5 specific recommendations
7. BEST PRACTICES: Which best practices are followed/missing?
8. RISK ASSESSMENT: Overall risk level (Low/Medium/High/Critical)
9. SUMMARY: 2-3 sentence executive summary

Be thorough, specific, and actionable. Under 500 words.`;

  const review = await callReviewAI(prompt);
  return review;
};

// ─── Parse Review Score ───────────────────────────────────
export const parseReviewScore = (reviewText) => {
  // Try to extract score from text
  const scoreMatch = reviewText.match(
    /(?:SCORE|score|Score)[:\s]*(\d+)/
  );
  const qualityMatch = reviewText.match(
    /(?:QUALITY|quality|Quality)[:\s]*(\d+)/
  );
  const riskMatch = reviewText.match(
    /(?:RISK|risk|Risk)[:\s]*(Low|Medium|High|Critical)/i
  );

  return {
    score: scoreMatch
      ? parseInt(scoreMatch[1])
      : qualityMatch
      ? parseInt(qualityMatch[1]) * 10
      : null,
    risk: riskMatch ? riskMatch[1] : null,
  };
};