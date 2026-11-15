
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json"
  }
});

export const runDP = async (batteryData) => {
  const response = await API.post(
    "/api/optimize/dp",
    batteryData
  );

  return response.data;
};

export const runGreedy = async (batteryData) => {
  const response = await API.post(
    "/api/optimize/greedy",
    batteryData
  );

  return response.data;
};

export const runBothAlgorithms = async (batteryData) => {
  const [dp, greedy] = await Promise.all([
    runDP(batteryData),
    runGreedy(batteryData)
  ]);

  return { dp, greedy };
};
