import {
  TrendingUp,
  Zap,
  Play,
  LoaderCircle
} from "lucide-react";

import { ProfitChart } from "./Charts";
import ScheduleTable from "./ScheduleTable";

const money = (value) =>
  `₹${Number(value || 0).toFixed(4)}`;

export default function AlgorithmsResults({
  results,
  onOptimize,
  loading
}) {
  return (
    <>
      <div className="page-intro">
        <div>
          <span className="eyebrow">ANALYSIS CENTER</span>
          <h2>DP vs Greedy</h2>
          <p>
            Compare the dynamic programming solution with the greedy
            heuristic.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={onOptimize}
          disabled={loading}
        >
          {loading ? (
            <LoaderCircle className="spin" size={17} />
          ) : (
            <Play size={16} />
          )}

          {loading ? "Running..." : "Run again"}
        </button>
      </div>

      {!results ? (
        <div className="panel empty-state">
          <TrendingUp size={34} />
          <h3>No optimization results yet</h3>
          <p>
            Run both algorithms using your current battery settings
            and electricity prices.
          </p>

          <button
            className="primary-button"
            onClick={onOptimize}
            disabled={loading}
          >
            <Play size={16} />
            Run optimization
          </button>
        </div>
      ) : (
        <>
          <div className="result-highlight-grid">
            <article className="result-highlight dp-highlight">
              <div className="result-label">
                <span className="result-icon">
                  <TrendingUp size={17} />
                </span>

                DYNAMIC PROGRAMMING

                <span className="result-tag">OPTIMAL</span>
              </div>

              <strong>{money(results.dp.maximumProfit)}</strong>

              <p>
                Maximum net profit for the defined discrete model
              </p>
            </article>

            <article className="result-highlight greedy-highlight">
              <div className="result-label">
                <span className="result-icon">
                  <Zap size={17} />
                </span>

                GREEDY ALGORITHM

                <span className="result-tag heuristic">HEURISTIC</span>
              </div>

              <strong>{money(results.greedy.netProfit)}</strong>

              <p>
                Net profit from ranked buy/sell opportunities
              </p>
            </article>
          </div>

          <ProfitChart results={results} />

          <article className="panel comparison-panel">
            <div className="chart-header">
              <div>
                <span className="eyebrow">SIDE-BY-SIDE</span>
                <h3>Solution comparison</h3>
                <p>
                  Both algorithms were run using the same input parameters.
                </p>
              </div>
            </div>

            <div className="comparison-table">
              <div className="comparison-row comparison-header">
                <span>Metric</span>
                <span>Dynamic programming</span>
                <span>Greedy</span>
              </div>

              <div className="comparison-row">
                <span>Net profit</span>
                <strong>{money(results.dp.maximumProfit)}</strong>
                <strong>{money(results.greedy.netProfit)}</strong>
              </div>

              <div className="comparison-row">
                <span>Initial SOC</span>
                <span>{results.dp.initialSOC} kWh</span>
                <span>{results.greedy.initialSOC} kWh</span>
              </div>

              <div className="comparison-row">
                <span>Final SOC</span>
                <span>{results.dp.finalSOC} kWh</span>
                <span>{results.greedy.finalSOC} kWh</span>
              </div>

              <div className="comparison-row">
                <span>Time windows</span>
                <span>{results.dp.timeSlots}</span>
                <span>{results.greedy.timeSlots}</span>
              </div>
            </div>
          </article>

          <ScheduleTable results={results} />
        </>
      )}
    </>
  );
}