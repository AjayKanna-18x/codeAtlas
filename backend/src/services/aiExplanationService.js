import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config/env.js";

// ─── Initialize Gemini ────────────────────────────────────
let geminiModel = null;

const getGeminiModel = () => {
  if (!geminiModel) {
    const genAI = new GoogleGenerativeAI(config.geminiApiKey);
    geminiModel = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });
  }
  return geminiModel;
};

// ─── Call AI API ──────────────────────────────────────────
const callAI = async (prompt) => {
  try {
    if (config.aiProvider === "gemini") {
      const model = getGeminiModel();
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    }

    // Fallback response if no API key
    return "AI service is not configured. Please add your API key to .env file.";
  } catch (error) {
    console.error(`❌ AI Error: ${error.message}`);
    throw new Error(`AI generation failed: ${error.message}`);
  }
};

// ─── Generate File Summary ────────────────────────────────
export const generateFileSummary = async (fileData) => {
  const prompt = `
You are a senior software engineer analyzing JavaScript code.

Analyze this file and provide a concise technical summary.

File Name: ${fileData.fileName}
File Path: ${fileData.relativePath}
Lines of Code: ${fileData.stats?.linesOfCode || 0}
Number of Functions: ${fileData.stats?.functionCount || 0}
Number of Imports: ${fileData.stats?.importCount || 0}
Number of Exports: ${fileData.stats?.exportCount || 0}

Imports this file uses:
${
  fileData.imports?.length > 0
    ? fileData.imports.map((imp) => `- ${imp.source}`).join("\n")
    : "No imports"
}

Exports this file provides:
${
  fileData.exports?.length > 0
    ? fileData.exports.map((exp) => `- ${exp.name || exp}`).join("\n")
    : "No exports"
}

Please provide:
1. What this file does (2-3 sentences)
2. Its role in the application
3. Key responsibilities
4. Dependencies it relies on

Keep the response concise, technical, and under 150 words.
Format with clear sections.
`;

  const response = await callAI(prompt);
  return response;
};

// ─── Generate Module Explanation ─────────────────────────
export const generateModuleExplanation = async (moduleData) => {
  const prompt = `
You are a senior software engineer explaining code architecture.

Explain this module/file to a developer who is new to the codebase.

Module: ${moduleData.fileName}
Type: ${moduleData.type || "unknown"}
Path: ${moduleData.relativePath}

It depends on these files:
${
  moduleData.dependsOn?.length > 0
    ? moduleData.dependsOn.join("\n")
    : "No dependencies"
}

These files depend on it:
${
  moduleData.usedBy?.length > 0
    ? moduleData.usedBy.join("\n")
    : "No dependents"
}

Provide:
1. Simple explanation of what this module does
2. Why it exists in the codebase
3. How it connects to other modules
4. What would break if this file was removed

Use simple language. Under 200 words.
`;

  const response = await callAI(prompt);
  return response;
};

// ─── Generate Architecture Explanation ───────────────────
export const generateArchitectureExplanation = async (graphData) => {
  const prompt = `
You are a software architect analyzing a JavaScript project structure.

Analyze this project's dependency graph and explain its architecture.

Project Statistics:
- Total Files: ${graphData.totalNodes}
- Total Dependencies: ${graphData.totalEdges}
- Isolated Files (potential dead code): ${graphData.isolatedNodes}
- Most Connected File (hub): ${graphData.mostConnectedFile || "unknown"}

File Types Found:
${
  graphData.fileTypes
    ? Object.entries(graphData.fileTypes)
        .map(([type, count]) => `- ${type}: ${count} files`)
        .join("\n")
    : "Mixed file types"
}

Entry Points:
${
  graphData.entryPoints?.length > 0
    ? graphData.entryPoints.slice(0, 5).join("\n")
    : "No clear entry points"
}

Please provide:
1. Overall architecture pattern (MVC, Layered, Microservices, etc.)
2. How the application is structured
3. Key architectural observations
4. Potential improvements

Keep it technical but clear. Under 250 words.
`;

  const response = await callAI(prompt);
  return response;
};

// ─── Answer Custom Question ───────────────────────────────
export const answerCodebaseQuestion = async (question, contextData) => {
  const prompt = `
You are an expert software engineer helping a developer understand a JavaScript codebase.

Codebase Context:
- Total Files: ${contextData.totalFiles || 0}
- Total Dependencies: ${contextData.totalDependencies || 0}
- Dead Code Files: ${contextData.deadCodeFiles || 0}
- Most Connected File: ${contextData.mostConnectedFile || "unknown"}

Available Files:
${
  contextData.files?.length > 0
    ? contextData.files
        .slice(0, 20)
        .map((f) => `- ${f.relativePath} (${f.stats?.linesOfCode || 0} lines)`)
        .join("\n")
    : "File list not available"
}

Developer Question: ${question}

Provide a helpful, accurate, and concise answer based on the codebase context.
If you cannot determine the answer from the context, say so clearly.
Under 200 words.
`;

  const response = await callAI(prompt);
  return response;
};

// ─── Generate Project Summary ─────────────────────────────
export const generateProjectSummary = async (projectData) => {
  const prompt = `
You are a technical writer creating project documentation.

Create a comprehensive project summary for this JavaScript codebase.

Project: ${projectData.name} by ${projectData.owner}
Description: ${projectData.description || "No description provided"}
Total Files: ${projectData.stats?.totalFiles || 0}
JS Files: ${projectData.stats?.jsFiles || 0}
Total Lines: ${projectData.stats?.totalLines || 0}
Dependencies: ${projectData.stats?.totalDependencies || 0}
Dead Code Files: ${projectData.stats?.deadCodeFiles || 0}

Please write:
1. Project overview (what it does)
2. Technical stack observations
3. Code quality assessment
4. Architecture summary
5. Notable observations

Professional tone. Under 300 words.
`;

  const response = await callAI(prompt);
  return response;
};