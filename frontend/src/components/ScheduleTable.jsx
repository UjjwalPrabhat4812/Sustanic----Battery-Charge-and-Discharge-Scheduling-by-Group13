const slotLabels = [
  "08–10 AM",
  "10 AM–12 PM",
  "12–02 PM",
  "02–04 PM",
  "04–06 PM",
  "06–08 PM",
  "08–10 PM"
];

const money = (value) =>
  `₹${Number(value || 0).toFixed(4)}`;

export default function ScheduleTable({ results }) {
  if (!results?.dp?.schedule) return null;

  return (
    <article className="panel schedule-panel">
      <div className="chart-header">
        <div>
          <span className="eyebrow">OPERATING PLAN</span>
          <h3>Optimized battery schedule</h3>
          <p>
            Dynamic Programming decisions for each two-hour interval
          </p>
        </div>

        <span className="table-count">7 INTERVALS</span>
      </div>

      <div className="table-wrapper">
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Time window</th>
              <th>Price</th>
              <th>Action</th>
              <th>Energy bought</th>
              <th>Energy sold</th>
              <th>Battery SOC</th>
              <th>Net cash flow</th>
            </tr>
          </thead>

          <tbody>
            {results.dp.schedule.map((item, index) => (
              <tr key={item.slot ?? index}>
                <td>
                  <strong>{slotLabels[index]}</strong>
                </td>

                <td>
                  ₹{Number(item.price).toFixed(2)}
                </td>

                <td>
                  <span
                    className={`action-tag ${String(
                      item.action
                    ).toLowerCase()}`}
                  >
                    {item.action}
                  </span>
                </td>

                <td>
                  {Number(item.energyBought).toFixed(2)} kWh
                </td>

                <td>
                  {Number(item.energySold).toFixed(2)} kWh
                </td>

                <td>
                  <strong>
                    {Number(item.socAfter).toFixed(2)} kWh
                  </strong>
                </td>

                <td className={item.profit >= 0 ? "positive" : "negative"}>
                  {money(item.profit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}