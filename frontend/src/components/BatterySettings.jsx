import { Activity, Play, LoaderCircle } from "lucide-react";

const fields = [
  ["capacity", "Battery capacity", "kWh"],
  ["initialSOC", "Initial state of charge", "kWh"],
  ["resolution", "Energy resolution", "kWh"],
  ["maxChargePower", "Maximum charge power", "kW"],
  ["maxDischargePower", "Maximum discharge power", "kW"],
  ["etaC", "Charge efficiency", "0–1"],
  ["etaD", "Discharge efficiency", "0–1"],
  ["degradationCost", "Degradation cost", "₹ / kWh"]
];

const slotLabels = [
  "08–10 AM",
  "10 AM–12 PM",
  "12–02 PM",
  "02–04 PM",
  "04–06 PM",
  "06–08 PM",
  "08–10 PM"
];

export default function BatterySettings({
  battery,
  setBattery,
  prices,
  setPrices,
  onOptimize,
  loading
}) {
  const handleBatteryChange = (event) => {
    const { name, value } = event.target;

    setBattery((previous) => ({
      ...previous,
      [name]: value === "" ? "" : Number(value)
    }));
  };

  const handlePriceChange = (index, value) => {
    setPrices((previous) =>
      previous.map((price, i) =>
        i === index ? (value === "" ? "" : Number(value)) : price
      )
    );
  };

  return (
    <>
      <div className="page-intro">
        <div>
          <span className="eyebrow">INPUT WORKSPACE</span>
          <h2>Battery & price settings</h2>
          <p>
            Adjust your storage system and electricity price assumptions
            before optimization.
          </p>
        </div>

        <span className="updated-label">
          <span className="status-dot" />
          Changes apply to next run
        </span>
      </div>

      <div className="settings-layout">
        <article className="panel settings-panel">
          <div className="chart-header">
            <div>
              <span className="eyebrow">BATTERY MODEL</span>
              <h3>Storage parameters</h3>
              <p>
                Define the physical and operating limits of the battery.
              </p>
            </div>
          </div>

          <div className="form-grid">
            {fields.map(([name, label, unit]) => (
              <label className="field" key={name}>
                <span>{label}</span>

                <div className="input-with-unit">
                  <input
                    type="number"
                    name={name}
                    min="0"
                    step="any"
                    value={battery[name]}
                    onChange={handleBatteryChange}
                  />

                  <small>{unit}</small>
                </div>
              </label>
            ))}
          </div>

          <div className="settings-note">
            <Activity size={16} />
            <span>
              Final battery charge is constrained to equal the initial
              state of charge.
            </span>
          </div>
        </article>

        <article className="panel settings-panel">
          <div className="chart-header">
            <div>
              <span className="eyebrow"> PRICE PROFILE</span>
              <h3>Electricity prices</h3>
              <p>
                Set the energy price for each two-hour operating window.
              </p>
            </div>

            <span className="chart-unit">₹ / kWh</span>
          </div>

          <div className="price-editor">
            {prices.map((price, index) => (
              <label className="price-editor-row" key={index}>
                <span className="price-index">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="price-time">
                  <strong>{slotLabels[index]}</strong>
                  <small>Operating interval</small>
                </span>

                <div className="input-with-unit">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={price}
                    onChange={(event) =>
                      handlePriceChange(index, event.target.value)
                    }
                  />
                  <small>₹</small>
                </div>
              </label>
            ))}
          </div>
        </article>
      </div>

      <div className="settings-footer">
        <span>
          Review your inputs before running the scheduling algorithms.
        </span>

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

          {loading ? "Optimizing..." : "Save & optimize"}
        </button>
      </div>
    </>
  );
}