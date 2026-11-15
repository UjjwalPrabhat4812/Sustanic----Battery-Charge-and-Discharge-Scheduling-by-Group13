import { useState } from "react";
import {
  Play,
  Menu,
  LoaderCircle
} from "lucide-react";

import Sidebar from "./components/Sidebar";
import Overview from "./components/Overview";
import BatterySettings from "./components/BatterySettings";
import AlgorithmsResults from "./components/AlgorithmsResults";
import Schedule from "./components/Schedule";

import { runBothAlgorithms } from "./services/api";

import "./App.css";

const initialBattery = {
  capacity: 10,
  initialSOC: 2,
  resolution: 0.1,
  maxChargePower: 2,
  maxDischargePower: 2,
  etaC: 0.95,
  etaD: 0.95,
  degradationCost: 0.5
};

function App() {
  const [activePage, setActivePage] = useState("overview");

  const [battery, setBattery] = useState(initialBattery);

  const [prices, setPrices] = useState([
    2, 3, 5, 8, 10, 7, 4
  ]);

  const [results, setResults] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [mobileMenu, setMobileMenu] = useState(false);

  const pageTitles = {
    overview: "Overview",
    settings: "Battery & Prices",
    results: "DP vs Greedy",
    schedule: "Usage Strategy"
  };

  // Run both optimization algorithms
  const handleOptimize = async () => {
    setLoading(true);
    setError("");

    try {
      const inputData = {
        ...battery,
        prices: prices.map(Number)
      };

      const data = await runBothAlgorithms(inputData);

      setResults(data);
      setActivePage("results");
    } catch (err) {
      console.error("Optimization error:", err);

      setError(
        err.response?.data?.error ||
        err.message ||
        "Optimization failed. Check whether the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // Render selected page
  const renderPage = () => {
    switch (activePage) {
      case "overview":
        return (
          <Overview
            battery={battery}
            prices={prices}
            results={results}
            onOptimize={handleOptimize}
            loading={loading}
            onSettings={() => setActivePage("settings")}
          />
        );

      case "settings":
        return (
          <BatterySettings
            battery={battery}
            setBattery={setBattery}
            prices={prices}
            setPrices={setPrices}
            onOptimize={handleOptimize}
            loading={loading}
          />
        );

      case "results":
        return (
          <AlgorithmsResults
            results={results}
            onOptimize={handleOptimize}
            loading={loading}
          />
        );

      case "schedule":
        return (
          <Schedule
            results={results}
            battery={battery}
            prices={prices}
            onOptimize={handleOptimize}
            loading={loading}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="app-shell">

      {/* Sidebar navigation */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        mobileMenu={mobileMenu}
        setMobileMenu={setMobileMenu}
      />

      {/* Main application */}
      <main className="main-area">

        {/* Top navigation bar */}
        <header className="topbar">

          <div className="topbar-left">

            <button
              className="mobile-menu"
              onClick={() => setMobileMenu(true)}
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>

            <div>
              <span className="breadcrumb">
                Sustanic <span>/</span> Workspace
              </span>

              <strong>
                {pageTitles[activePage]}
              </strong>
            </div>

          </div>

          <div className="topbar-right">

            {/* <span className="system-label">
              <span className="status-dot" />
              Simulation ready
            </span> */}

            <button
              className="primary-button top-run"
              onClick={handleOptimize}
              disabled={loading}
            >
              {loading ? (
                <LoaderCircle
                  className="spin"
                  size={16}
                />
              ) : (
                <Play
                  size={15}
                  fill="currentColor"
                />
              )}

              {loading ? "Running..." : "Run optimization"}
            </button>

          </div>
        </header>

        {/* Page content */}
        <section className="page-content">

          {/* Error message */}
          {error && (
            <div className="error-message">
              <span>{error}</span>

              <button onClick={() => setError("")}>
                Dismiss
              </button>
            </div>
          )}

          {/* Selected component */}
          {renderPage()}

        </section>
      </main>
    </div>
  );
}

export default App;