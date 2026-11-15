import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine
} from "recharts";

import {
  BatteryCharging,
  GitCompareArrows
} from "lucide-react";

const slotLabels = [
  "08–10 AM",
  "10 AM–12 PM",
  "12–02 PM",
  "02–04 PM",
  "04–06 PM",
  "06–08 PM",
  "08–10 PM"
];

const boundaryTimes = [
  "08:00 AM",
  "10:00 AM",
  "12:00 PM",
  "02:00 PM",
  "04:00 PM",
  "06:00 PM",
  "08:00 PM",
  "10:00 PM"
];

const money = (value) =>
  `₹${Number(value || 0).toFixed(2)}`;

function ChartHeader({ eyebrow, title, description, right }) {
  return (
    <div className="chart-header">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>

      {right}
    </div>
  );
}

function CustomTooltip({ active, payload, label, unit = "kWh" }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="chart-tooltip">
      <span className="tooltip-time">{label}</span>

      {payload.map((entry, index) => (
        <div className="tooltip-line" key={index}>
          <span
            className="tooltip-dot"
            style={{ background: entry.color || entry.fill }}
          />

          <span>{entry.name}</span>

          <strong>
            {unit === "₹"
              ? money(entry.value)
              : `${Number(entry.value).toFixed(2)} ${unit}`}
          </strong>
        </div>
      ))}
    </div>
  );
}

export function SOCChart({ results, capacity }) {
  const schedule = results?.dp?.schedule || [];

  const data = [
    {
      time: boundaryTimes[0],
      soc: Number(results?.dp?.initialSOC ?? 0)
    },
    ...schedule.map((item, index) => ({
      time: boundaryTimes[index + 1],
      soc: Number(item.socAfter)
    }))
  ];

  return (
    <article className="chart-card chart-card-large">
      <ChartHeader
        eyebrow="BATTERY PERFORMANCE"
        title="State of charge"
        description="Stored energy across today's operating window"
        right={<span className="chart-unit">kWh</span>}
      />

      {results ? (
        <div className="chart-area soc-chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 12, right: 12, left: -18, bottom: 0 }}
            >
              <defs>
                <linearGradient id="socFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3978ed" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#3978ed" stopOpacity={0.015} />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="#e9eef5"
                strokeDasharray="3 5"
                vertical={false}
              />

              <XAxis
                dataKey="time"
                tick={{ fill: "#7d8ba1", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                dy={10}
              />

              <YAxis
                domain={[0, capacity]}
                tick={{ fill: "#7d8ba1", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />

              <ReferenceLine
                y={capacity}
                stroke="#cbd5e1"
                strokeDasharray="4 4"
              />

              <Tooltip content={<CustomTooltip unit="kWh" />} />

              <Area
                type="monotone"
                dataKey="soc"
                name="Battery SOC"
                stroke="#3978ed"
                strokeWidth={3}
                fill="url(#socFill)"
                activeDot={{ r: 5 }}
                dot={{
                  r: 3,
                  fill: "#3978ed",
                  stroke: "#fff",
                  strokeWidth: 2
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="chart-empty">
          <BatteryCharging size={26} />
          <span>Run optimization to see battery performance.</span>
        </div>
      )}

      <div className="chart-footnote">
        <span className="legend-mark blue" />
        Battery energy
        <span className="chart-footnote-muted">
          · Maximum capacity {capacity} kWh
        </span>
      </div>
    </article>
  );
}

export function PriceChart({ prices }) {
  const data = prices.map((price, index) => ({
    time: slotLabels[index],
    price: Number(price)
  }));

  const maxPrice = Math.max(...prices.map(Number));
  const minPrice = Math.min(...prices.map(Number));

  return (
    <article className="chart-card">
      <ChartHeader
        eyebrow="MARKET INPUT"
        title="Electricity price curve"
        description="Price movement through seven time windows"
        right={<span className="chart-unit">₹ / kWh</span>}
      />

      <div className="price-summary">
        <div>
          <span>Peak price</span>
          <strong>{money(maxPrice)}</strong>
        </div>

        <div>
          <span>Lowest price</span>
          <strong>{money(minPrice)}</strong>
        </div>
      </div>

      <div className="chart-area price-chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 8, left: -18, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id="priceFill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#12a58b" stopOpacity={0.24} />
                <stop offset="100%" stopColor="#12a58b" stopOpacity={0.015} />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="#e9eef5"
              strokeDasharray="3 5"
              vertical={false}
            />

            <XAxis
              dataKey="time"
              tick={{ fill: "#7d8ba1", fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-17}
              textAnchor="end"
              height={46}
            />

            <YAxis
              tick={{ fill: "#7d8ba1", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip content={<CustomTooltip unit="₹" />} />

            <Area
              type="monotone"
              dataKey="price"
              name="Tariff"
              stroke="#0f9b83"
              strokeWidth={2.8}
              fill="url(#priceFill)"
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-footnote">
        <span className="legend-mark teal" />
        Electricity tariff
        <span className="chart-footnote-muted">
          · User-provided simulation data
        </span>
      </div>
    </article>
  );
}

export function ProfitChart({ results }) {
  if (!results) {
    return (
      <article className="chart-card">
        <ChartHeader
          title="Algorithm profit comparison"
          description="Compare net profit from both strategies"
        />

        <div className="chart-empty">
          <GitCompareArrows size={26} />
          <span>Run both algorithms to compare results.</span>
        </div>
      </article>
    );
  }

  const data = [
    {
      algorithm: "Dynamic Programming",
      profit: Number(results.dp.maximumProfit),
      color: "#3978ed"
    },
    {
      algorithm: "Greedy",
      profit: Number(results.greedy.netProfit),
      color: "#12a58b"
    }
  ];

  return (
    <article className="chart-card">
      <ChartHeader
        eyebrow="OPTIMIZATION OUTPUT"
        title="Net profit comparison"
        description="Profit achieved under the same battery constraints"
        right={<span className="chart-unit">INR</span>}
      />

      <div className="chart-area profit-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 6, right: 22, left: 8, bottom: 4 }}
          >
            <CartesianGrid
              stroke="#e9eef5"
              strokeDasharray="3 5"
              horizontal={false}
            />

            <XAxis
              type="number"
              tick={{ fill: "#7d8ba1", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `₹${value}`}
            />

            <YAxis
              type="category"
              dataKey="algorithm"
              width={112}
              tick={{ fill: "#56657b", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />

          <Tooltip
  cursor={false}
  contentStyle={{
    backgroundColor: "#272728",
    border: "1px solid #272728",
    // borderTop: "2px solid black",
    borderRadius: "10px",
    color: "#172033",
  }}
  labelStyle={{ color: "white" }}
  itemStyle={{ color: "#d1d2d2" }}
/>

            <Bar
              dataKey="profit"
              name="Net profit"
              barSize={25}
              radius={[0, 7, 7, 0]}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.algorithm}
                  fill={entry.color}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-footnote">
        <span className="legend-mark blue" />
        Dynamic Programming
        <span className="legend-mark teal legend-gap" />
        Greedy
      </div>
    </article>
  );
}