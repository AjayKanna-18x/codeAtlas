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
              background: "#1e293b",
              color: "#e2e8f0",
              border: "1px solid #334155",
              fontFamily: "Fira Code, monospace",
              fontSize: "0.85rem",
            },
            success: {
              iconTheme: {
                primary: "#22c55e",
                secondary: "#1e293b",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#1e293b",
              },
            },
          }}
        />
      </Router>
    </ErrorBoundary>
  );
}

export default App;