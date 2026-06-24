import * as parser from "@babel/parser";
import path from "path";

// ─── Parse JS file into AST ───────────────────────────────
export const parseFileToAST = (code, filePath = "") => {
  try {
    const ast = parser.parse(code, {
      sourceType: "module",
      errorRecovery: true,
      plugins: [
        "jsx",
        "typescript",
        "decorators-legacy",
        "classProperties",
        "optionalChaining",
        "nullishCoalescingOperator",
        "dynamicImport",
      ],
    });
    return { success: true, ast, error: null };
  } catch (error) {
    console.warn(`⚠️ AST parse warning for ${filePath}: ${error.message}`);
    return { success: false, ast: null, error: error.message };
  }
};

// ─── Extract imports from AST ─────────────────────────────
export const extractImports = (ast) => {
  const imports = [];

  if (!ast || !ast.program || !ast.program.body) return imports;

  for (const node of ast.program.body) {
    // ES6 import statements
    if (node.type === "ImportDeclaration") {
      const source = node.source.value;
      const specifiers = node.specifiers.map((s) => {
        if (s.type === "ImportDefaultSpecifier") {
          return { type: "default", name: s.local.name };
        }
        if (s.type === "ImportNamespaceSpecifier") {
          return { type: "namespace", name: s.local.name };
        }
        if (s.type === "ImportSpecifier") {
          return {
            type: "named",
            name: s.imported.name,
            alias: s.local.name,
          };
        }
        return { type: "unknown", name: s.local?.name };
      });

      imports.push({ source, specifiers, type: "static" });
    }

    // CommonJS require() calls
    if (
      node.type === "VariableDeclaration" ||
      node.type === "ExpressionStatement"
    ) {
      const requireImports = extractRequireCalls(node);
      imports.push(...requireImports);
    }
  }

  return imports;
};

// ─── Extract require() calls ──────────────────────────────
const extractRequireCalls = (node) => {
  const imports = [];

  const findRequire = (n) => {
    if (!n || typeof n !== "object") return;

    if (
      n.type === "CallExpression" &&
      n.callee?.name === "require" &&
      n.arguments?.[0]?.type === "StringLiteral"
    ) {
      imports.push({
        source: n.arguments[0].value,
        specifiers: [],
        type: "commonjs",
      });
    }

    for (const key of Object.keys(n)) {
      if (key === "type") continue;
      const child = n[key];
      if (child && typeof child === "object") {
        if (Array.isArray(child)) {
          child.forEach(findRequire);
        } else {
          findRequire(child);
        }
      }
    }
  };

  findRequire(node);
  return imports;
};

// ─── Extract exports from AST ─────────────────────────────
export const extractExports = (ast) => {
  const exports = [];

  if (!ast || !ast.program || !ast.program.body) return exports;

  for (const node of ast.program.body) {
    // export default
    if (node.type === "ExportDefaultDeclaration") {
      exports.push({
        type: "default",
        name: node.declaration?.id?.name || "default",
      });
    }

    // export const / export function
    if (node.type === "ExportNamedDeclaration") {
      if (node.declaration) {
        if (node.declaration.type === "VariableDeclaration") {
          node.declaration.declarations.forEach((d) => {
            exports.push({ type: "named", name: d.id?.name });
          });
        }
        if (
          node.declaration.type === "FunctionDeclaration" ||
          node.declaration.type === "ClassDeclaration"
        ) {
          exports.push({
            type: "named",
            name: node.declaration.id?.name,
          });
        }
      }

      // export { name1, name2 }
      if (node.specifiers) {
        node.specifiers.forEach((s) => {
          exports.push({ type: "named", name: s.exported?.name });
        });
      }
    }

    // module.exports = {}
    if (
      node.type === "ExpressionStatement" &&
      node.expression?.type === "AssignmentExpression" &&
      node.expression?.left?.object?.name === "module" &&
      node.expression?.left?.property?.name === "exports"
    ) {
      exports.push({ type: "commonjs", name: "module.exports" });
    }
  }

  return exports;
};

// ─── Count functions in AST ───────────────────────────────
export const countFunctions = (ast) => {
  let count = 0;

  if (!ast || !ast.program) return count;

  const countInNode = (node) => {
    if (!node || typeof node !== "object") return;

    if (
      node.type === "FunctionDeclaration" ||
      node.type === "FunctionExpression" ||
      node.type === "ArrowFunctionExpression"
    ) {
      count++;
    }

    for (const key of Object.keys(node)) {
      if (key === "type") continue;
      const child = node[key];
      if (child && typeof child === "object") {
        if (Array.isArray(child)) {
          child.forEach(countInNode);
        } else {
          countInNode(child);
        }
      }
    }
  };

  countInNode(ast.program);
  return count;
};

// ─── Resolve import path ──────────────────────────────────
export const resolveImportPath = (importSource, currentFilePath, projectRoot) => {
  // Skip external packages (no ./ or ../)
  if (!importSource.startsWith(".")) {
    return { type: "external", resolved: importSource };
  }

  try {
    const currentDir = path.dirname(currentFilePath);
    let resolved = path.resolve(currentDir, importSource);
    resolved = path.relative(projectRoot, resolved).replace(/\\/g, "/");

    // Add .js if no extension
    if (!path.extname(resolved)) {
      resolved = resolved + ".js";
    }

    return { type: "internal", resolved };
  } catch {
    return { type: "unknown", resolved: importSource };
  }
};