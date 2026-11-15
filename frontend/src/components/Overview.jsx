import {
  BatteryCharging,
  Gauge,
  Wallet,
  TrendingUp,
  Zap,
  Sun,
  Waves,
  Play,
  Settings2,
  ArrowUpRight,
  ChevronRight
} from "lucide-react";

import {
  SOCChart,
  PriceChart,
  ProfitChart
} from "./Charts";

import ScheduleTable from "./ScheduleTable";

const money = (value) =>
  `₹${Number(value || 0).toFixed(4)}`;

function StatCard({ title, value, subtitle, icon: Icon, tone }) {
  return (
    <article className="stat-card">
      <div className="stat-card-top">
        <span className="stat-label">{title}</span>

        <span className={`stat-icon ${tone}`}>
          <Icon size={19} />
        </span>
      </div>

      <div className="stat-value-row">
        <h2>{value}</h2>
      </div>

      <p>{subtitle}</p>
    </article>
  );
}

export default function Overview({
  battery,
  prices,
  results,
  onOptimize,
  loading,
  onSettings
}) {
  const averagePrice =
    prices.reduce((sum, price) => sum + Number(price), 0) /
    prices.length;

  const bestProfit = results
    ? Math.max(
        Number(results.dp.maximumProfit),
        Number(results.greedy.netProfit)
      )
    : null;

  return (
    <>
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="hero-kicker">
            <span className="hero-kicker-dot" />
            ENERGY CONTROL GRID
          </span>

          <h2>
            Make every unit of energy <em>work smarter.</em>
          </h2>

          <p>
            Plan battery charging and discharging around your electricity
            prices. Compare two algorithms and find a more efficient
            operating schedule.
          </p>

          <div className="hero-actions">
            <button
              className="primary-button hero-button"
              onClick={onOptimize}
              disabled={loading}
            >
              <Play size={16} fill="currentColor" />
              {loading ? "Optimizing..." : "Run optimization"}
              <ChevronRight size={16} />
            </button>

            <button
              className="secondary-button"
              onClick={onSettings}
            >
              <Settings2 size={16} />
              Configure resources
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />

          <div className="hero-battery">
            <div className="battery-cap" />
            <div className="battery-body">
              <div className="battery-level">
                <Zap size={31} fill="currentColor" />
              </div>
            </div>
          </div>

          <div className="energy-chip chip-top">
            <Sun size={15} />
            Smart energy
          </div>

          <div className="energy-chip chip-bottom">
            <Waves size={15} />
            Smarter profits
          </div>
        </div>
      </section>

      <div className="section-title-row">
        <div>
          <span className="eyebrow">AT A GLANCE</span>
          <h3>System overview</h3>
        </div>

        {/* <span className="updated-label">
          <span className="status-dot" />
          Local simulation
        </span> */}
      </div>

      <div className="stats-grid">
        <StatCard
          title="Storage capacity"
          value={`${battery.capacity} kWh`}
          subtitle="Configured battery size"
          icon={BatteryCharging}
          tone="blue"
        />

        <StatCard
          title="Starting energy"
          value={`${battery.initialSOC} kWh`}
          subtitle="Initial state of charge"
          icon={Gauge}
          tone="violet"
        />

        <StatCard
          title="Average price"
          value={`₹${averagePrice.toFixed(2)}`}
          subtitle="Across seven time windows"
          icon={Wallet}
          tone="teal"
        />

        <StatCard
          title="Best net profit"
          value={bestProfit === null ? "—" : money(bestProfit)}
          subtitle={
            results
              ? "From latest optimization"
              : "Run optimization to calculate"
          }
          icon={TrendingUp}
          tone="amber"
        />
      </div>

      <div className="dashboard-grid">
        <SOCChart
          results={results}
          capacity={Number(battery.capacity) || 10}
        />

        <PriceChart prices={prices} />
      </div>

      <div className="dashboard-grid secondary-grid">
        <ProfitChart results={results} />

        <article className="panel configuration-card">
          <div className="chart-header">
            <div>
              <span className="eyebrow">SYSTEM SETTINGS</span>
              <h3>Battery configuration</h3>
              <p>Current operating parameters</p>
            </div>

            <button
              className="icon-button"
              onClick={onSettings}
              aria-label="Edit settings"
            >
              <ArrowUpRight size={17} />
            </button>
          </div>

          <div className="configuration-list">
            <div>
              <span>Maximum charge power</span>
              <strong>{battery.maxChargePower} kW</strong>
            </div>

            <div>
              <span>Maximum discharge power</span>
              <strong>{battery.maxDischargePower} kW</strong>
            </div>

            <div>
              <span>Charge efficiency</span>
              <strong>{Number(battery.etaC * 100).toFixed(1)}%</strong>
            </div>

            <div>
              <span>Discharge efficiency</span>
              <strong>{Number(battery.etaD * 100).toFixed(1)}%</strong>
            </div>

            <div>
              <span>Degradation cost</span>
              <strong>₹{Number(battery.degradationCost).toFixed(2)} / kWh</strong>
            </div>
          </div>

          <button className="inline-link" onClick={onSettings}>
            Manage battery settings
            <ArrowUpRight size={14} />
          </button>
        </article>
      </div>

      {results && <ScheduleTable results={results} />}
    </>
  );
}