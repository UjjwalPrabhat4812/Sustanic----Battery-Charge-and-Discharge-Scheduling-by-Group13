# ⚡ Sustanic – OPTIMIZING LIFE

# BY GROUP 13

## 📌 Project Overview

Sustanic is a battery charge and discharge scheduling application designed for prosumers. It helps decide when a battery should charge, discharge, or remain idle based on electricity prices and battery operating limits.

The project compares two algorithmic approaches:

1. **Dynamic Programming (DP)** – finds the best schedule for the defined discrete model.
2. **Greedy Algorithm** – selects attractive charging and discharging opportunities using a heuristic strategy.


## 🎯 Problem Statement

Electricity prices can change throughout the day. A battery owner must decide when to store energy and when to use or sell stored energy. Making these decisions without considering prices and battery limits can result in lower profit or an invalid schedule.

**The problem is to determine a feasible battery charge/discharge schedule that maximizes net profit over a set of time periods**, given:

- Battery capacity and initial state of charge (SOC).
- Maximum charging and discharging power.
- Charging and discharging efficiency.
- Battery degradation cost.
- Electricity price for each time period.

The schedule must not exceed battery capacity or power limits, and it must respect the configured SOC and efficiency rules.

## 🛠️ Technologies Used

| Part | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| API communication | Axios |
| Backend | Node.js, Express.js |
| Optimization engines | C++ |
| Charts and visualization | Recharts |
| Icons and animations | Lucide React, Framer Motion |

## 🔄 System Flow

```text
              USER
               |
               v
      React Frontend
   (Battery settings & prices)
               |
               | Axios API request
               v
       Node.js + Express
       (Backend API routes)
               |
          +----+----+
          |         |
          v         v
       DP Engine  Greedy Engine
          |         |
          +----+----+
               |
               v
       Schedule and Profit
               |
               v
       Express JSON Response
               |
               v
        React Frontend
               |
               v
    Cards, Tables and Charts
```

### How frontend works with backend

1. The user enters battery settings and electricity prices in the React dashboard.
2. React stores the values in its application state.
3. When the user clicks **Run Optimization**, the frontend service sends the data to the backend using Axios.
4. Express receives the request and routes it to the selected optimization engine.
5. The C++ engine calculates the schedule and net profit.
6. The backend sends the result back as JSON.
7. React reads the response and updates the result cards, schedule table, and charts.

### Main API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/optimize/dp` | Runs the Dynamic Programming engine |
| `POST` | `/api/optimize/greedy` | Runs the Greedy engine |

Local backend URL: `http://localhost:5000`

## 🧾 Example Input

The following example contains seven electricity-price values, one for each two-hour period.

```json
{
  "capacity": 10,
  "initialSOC": 2,
  "resolution": 0.1,
  "maxChargePower": 2,
  "maxDischargePower": 2,
  "etaC": 0.95,
  "etaD": 0.95,
  "degradationCost": 0.5,
  "prices": [2, 3, 5, 8, 10, 7, 4]
}
```

| Parameter | Meaning |
|---|---|
| `capacity` | Maximum battery energy capacity |
| `initialSOC` | Energy stored in the battery at the start |
| `resolution` | Step size used to represent SOC states in DP |
| `maxChargePower` | Maximum charging power |
| `maxDischargePower` | Maximum discharging power |
| `etaC` | Charging efficiency |
| `etaD` | Discharging efficiency |
| `degradationCost` | Battery usage/degradation cost |
| `prices` | Electricity price in each time period |

### Scheduling periods

| Period | Time |
|---|---|
| 1 | 08:00–10:00 |
| 2 | 10:00–12:00 |
| 3 | 12:00–14:00 |
| 4 | 14:00–16:00 |
| 5 | 16:00–18:00 |
| 6 | 18:00–20:00 |
| 7 | 20:00–22:00 |

## 🧠 DP Engine – How It Works

Dynamic Programming is used to find the maximum net profit for the defined **discrete battery scheduling model**.

Instead of making only one decision at a time, DP considers different possible battery states across the time periods. It remembers the best profit found for each state so that it does not need to solve the same subproblem repeatedly.

### Main idea

- A **state** represents the battery's SOC at a particular time.
- An **action** can be charging, discharging, or staying idle.
- A **transition** moves the battery from its current SOC to a new SOC.
- A **DP table** stores the best profit found for reaching each state.

### How the DP code works

1. Read the battery settings and electricity prices.
2. Divide the battery's SOC range into small steps using the `resolution` value.
3. Create a DP table to store the best profit for each time period and SOC state.
4. Set the starting state using the initial SOC. Other states begin as unreachable.
5. Go through the electricity-price periods one by one.
6. For each reachable SOC, check three possible actions: charge, discharge, or idle.
7. Calculate the new SOC after each action, considering charging or discharging efficiency.
8. Check the battery capacity, SOC, and power limits. Ignore actions that break a constraint.
9. Calculate the profit or cost of each valid action, including degradation cost where configured.
10. Update the DP table when a new path gives a better profit for the resulting state.
11. After all periods are processed, select the best valid final result according to the engine's final-state rule.
12. Reconstruct the selected schedule if the implementation stores the previous decisions, then return the schedule and profit.

**In simple words:** DP checks many possible ways to operate the battery and remembers the best result for each battery state. It then selects the best valid result for the model.

## ⚙️ Greedy Engine – How It Works

The Greedy algorithm uses a heuristic approach. It looks for attractive charging and discharging opportunities and makes decisions based on the opportunity-ranking rules implemented in the engine.

Unlike DP, Greedy does not generally examine every possible future sequence of battery states.

### How the Greedy code works

1. Read the same battery settings and electricity prices used by DP.
2. Identify and rank attractive charging and discharging opportunities using the Greedy strategy.
3. Consider charging during an attractive buying opportunity.
4. Consider discharging during an attractive selling opportunity.
5. Calculate the energy change while considering charging or discharging efficiency.
6. Check the SOC, battery capacity, and power limits before accepting an action.
7. Include degradation cost in the profit calculation where configured.
8. Record the selected action and resulting SOC for each period.
9. Add the profit contributions to calculate the total net profit.
10. Return the generated schedule and profit to the backend.

**In simple words:** Greedy chooses opportunities that look good according to its rules, one decision at a time, while checking the battery limits. It is a heuristic and is not guaranteed to find the best possible schedule for every input.

## ⚖️ DP vs Greedy

| Comparison | Dynamic Programming | Greedy Algorithm |
|---|---|---|
| Approach | State-based optimization | Heuristic decision-making |
| Decision process | Checks feasible transitions between SOC states | Selects attractive opportunities using its rules |
| Future decisions | Considers multiple possible paths across periods | Does not generally evaluate every future sequence |
| SOC handling | Uses discretized SOC states | Tracks SOC while applying its decisions |
| Result | Best result for the correctly represented discrete model | A heuristic result; not always globally optimal |
| Main purpose | Optimization | Comparison and faster/simple decision strategy |

Both engines should receive the same input values for a fair comparison. In one previously tested configuration, both returned approximately **₹41.9337** net profit. This is a test result for that configuration, not a guarantee that both will always return the same profit.

## 🚀 Further Enhancements

1. **Performance comparison:** Measure execution time and memory usage of DP and Greedy for different input sizes.
2. **More optimization scenarios:** Test more electricity-price patterns, battery capacities, and efficiency values.
3. **Schedule export:** Allow users to download schedules and comparison reports in CSV or PDF format.
4. **Forecast integration:** Add electricity-price or renewable-generation forecasts to support more informed scheduling.

## 📁 Folder Structure

```text
Sustanic/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AlgorithmsResults.jsx
│   │   │   ├── BatterySettings.jsx
│   │   │   ├── Charts.jsx
│   │   │   ├── Overview.jsx
│   │   │   ├── Schedule.jsx
│   │   │   ├── ScheduleTable.jsx
│   │   │   └── Sidebar.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   └── package.json
│
└── backend/
    ├── routes/              # Express API routes (if separated)
    ├── ...                  # Backend services and configuration
    └── ...                  # C++ DP and Greedy engine files
```

> The frontend paths reflect the documented component structure. The backend section is abbreviated because the exact backend and C++ filenames were not provided. Update it to match the actual repository before publishing.

## ▶️ Running Locally

### Requirements

- Node.js and npm.
- A C++ compiler compatible with the backend's engine integration.
- Git (optional).

### 1. Clone or open the project

```bash
git clone <repository-url>
cd <repository-folder>
```

Replace the placeholders with the actual repository URL and folder name.

### 2. Start the backend

Open a terminal:

```bash
cd backend
npm install
npm run dev
```

If the backend does not have a `dev` script, run the start command defined in its `package.json`, for example:

```bash
npm start
```

The backend is expected to run at:

```text
http://localhost:5000
```

### 3. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite development URL printed in the terminal, commonly:

```text
http://localhost:5173
```

### 4. Run an optimization

1. Open the frontend in your browser.
2. Enter the battery parameters and electricity prices.
3. Click **Run Optimization**.
4. View the DP and Greedy results, schedules, and charts.

---

**Project:** Sustanic – OPTIMIZING LIFE  
**Domain:** Design and Analysis of Algorithms (DAA)  

