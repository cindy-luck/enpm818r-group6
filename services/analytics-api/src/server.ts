import express from "express";
import cors from "cors";
import { config } from "./config/env";
import analyticsRoutes from "./routes/analyticsRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/analytics", analyticsRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "analytics-api" });
});

app.listen(config.port, () => {
  console.log(`Analytics API listening on port ${config.port}`);
});
