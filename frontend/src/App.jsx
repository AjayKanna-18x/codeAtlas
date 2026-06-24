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
      <div className="app-container">
        <Navbar />
        <div className="app-body">
          <Sidebar />
          <main className="main-content">
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
// app.jsx is the main entry point of the React application. It sets up the routing for different pages using React Router. The Navbar and Sidebar components are rendered on every page, while the main content area changes based on the current route. The Toaster component is used for displaying notifications.

export default App;