import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ErrorBoundary from "./components/common/ErrorBoundary";
import LoadingScreen from "./components/common/LoadingScreen";
import { Toaster } from "react-hot-toast";

// ─── Lazy load pages ──────────────────────────────────────
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ImportPage = lazy(() => import("./pages/ImportPage"));
const GraphPage = lazy(() => import("./pages/GraphPage"));
const FilePage = lazy(() => import("./pages/FilePage"));
const AIPage = lazy(() => import("./pages/AIPage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const DeadCodePage = lazy(() => import("./pages/DeadCodePage"));
const AnalysisPage = lazy(() => import("./pages/AnalysisPage"));
const EvolutionPage = lazy(() => import("./pages/EvolutionPage"));
const CodeReviewPage = lazy(() => import("./pages/CodeReviewPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="app-container">
          <Navbar />
          <div className="app-body">
            <Sidebar />
            <main className="main-content">
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/import" element={<ImportPage />} />
                  <Route path="/graph" element={<GraphPage />} />
                  <Route path="/files" element={<FilePage />} />
                  <Route path="/ai" element={<AIPage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/deadcode" element={<DeadCodePage />} />
                  <Route path="/analysis" element={<AnalysisPage />} />
                  <Route path="/evolution" element={<EvolutionPage />} />
                  <Route path="/review" element={<CodeReviewPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#ffffff",
              color: "#0f172a",
              border: "1px solid #e2e8f0",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.85rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            },
            success: {
              iconTheme: {
                primary: "#16a34a",
                secondary: "#ffffff",
              },
            },
            error: {
              iconTheme: {
                primary: "#dc2626",
                secondary: "#ffffff",
              },
            },
          }}
        />
      </Router>
    </ErrorBoundary>
  );
}

export default App;