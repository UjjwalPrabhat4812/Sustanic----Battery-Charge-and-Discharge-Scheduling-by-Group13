import { CalendarDays, Play, CircleCheck } from "lucide-react";

import {
  SOCChart,
  PriceChart,
  ProfitChart
} from "./Charts";

import ScheduleTable from "./ScheduleTable";

export default function Schedule({
  results,
  battery,
  prices,
  onOptimize,
  loading
}) {
  return (
    <>
      <div className="page-intro">
        <div>
          <span className="eyebrow">OPERATING TIMELINE</span>
          <h2>Schedule & visualization</h2>
          <p>
            Explore the battery trajectory, tariff curve and recommended
            actions.
          </p>
        </div>
      </div>

      {!results ? (
        <div className="panel empty-state">
          <CalendarDays size={34} />
          <h3>Your schedule is waiting</h3>
          <p>
            Run optimization to generate the battery schedule and
            interactive charts.
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
          <div className="dashboard-grid">
            <SOCChart
              results={results}
              capacity={Number(battery.capacity) || 10}
            />

            <PriceChart prices={prices} />
          </div>

          <div className="dashboard-grid">
            <ProfitChart results={results} />

            <article className="panel schedule-summary">
              <div className="chart-header">
                <div>
                  <span className="eyebrow">SCHEDULE SUMMARY</span>
                  <h3>Operating constraints</h3>
                  <p>Validation of the optimized battery path</p>
                </div>
              </div>

              <div className="validation-list">
                <div>
                  <CircleCheck size={17} />
                  <span>Final SOC matches initial SOC</span>
                  <strong>{results.dp.finalSOC} kWh</strong>
                </div>

                <div>
                  <CircleCheck size={17} />
                  <span>Seven operating windows</span>
                  <strong>14 hours</strong>
                </div>

                <div>
                  <CircleCheck size={17} />
                  <span>Battery capacity</span>
                  <strong>{battery.capacity} kWh</strong>
                </div>
              </div>
            </article>
          </div>

          <ScheduleTable results={results} />
        </>
      )}
    </>
  );
}