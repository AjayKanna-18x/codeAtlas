import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import GraphPage from "./pages/GraphPage";
import FilePage from "./pages/FilePage";
import AIPage from "./pages/AIPage";
import HistoryPage from "./pages/HistoryPage";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-primary">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/graph" element={<GraphPage />} />
              <Route path="/files" element={<FilePage />} />
              <Route path="/ai" element={<AIPage />} />
              <Route path="/history" element={<HistoryPage />} />
            </Routes>
          </main>
        </div>
        <Toaster position="bottom-right" />
      </div>
    </Router>
  );
}

export default App;