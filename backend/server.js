
const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

const SLOT_COUNT = 7;

function runAlgorithm(executable, input) {
  return new Promise((resolve, reject) => {
    const process = spawn(
      path.join(__dirname, "executables", executable)
    );

    let output = "";
    let errorOutput = "";

    process.stdout.on("data", data => {
      output += data.toString();
    });

    process.stderr.on("data", data => {
      errorOutput += data.toString();
    });

    process.on("error", reject);

    process.on("close", code => {
      if (code !== 0) {
        return reject(
          new Error(errorOutput || `Process exited with code ${code}`)
        );
      }

      try {
        resolve(JSON.parse(output));
      } catch {
        reject(new Error("Invalid JSON returned by C++"));
      }
    });

    process.stdin.end(input);
  });
}

function buildInput(body) {
  const {
    capacity,
    initialSOC,
    resolution,
    maxChargePower,
    maxDischargePower,
    etaC,
    etaD,
    degradationCost,
    prices
  } = body;

  const values = [
    capacity,
    initialSOC,
    resolution,
    maxChargePower,
    maxDischargePower,
    etaC,
    etaD,
    degradationCost
  ];

  if (
    !values.every(v => typeof v === "number" && Number.isFinite(v)) ||
    !Array.isArray(prices) ||
    prices.length !== SLOT_COUNT ||
    !prices.every(v => typeof v === "number" &&
      Number.isFinite(v) && v >= 0)
  ) {
    throw new Error("Invalid battery configuration or prices");
  }

  return values.join(" ") + "\n" +
    prices.join(" ") + "\n";
}

app.post("/api/optimize/dp", async (req, res) => {
  try {
    const input = buildInput(req.body);
    const result = await runAlgorithm("dp.exe", input);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/optimize/greedy", async (req, res) => {
  try {
    const input = buildInput(req.body);
    const result = await runAlgorithm("greedy.exe", input);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(5000, () => {
  console.log("Battery Optimizer API running on port 5000");
});
