import express from "express";
import cors from "cors";
import { config } from "./config/env";
import { processVideo } from "./services/videoService";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "processor" });
});

// Endpoint called by Uploader API
app.post("/process", async (req, res) => {
  const { videoId, s3Key, bucket } = req.body;

  if (!videoId || !s3Key || !bucket) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Acknowledge immediately (Async Processing)
  res.status(202).json({ message: "Processing started" });

  // Trigger background processing
  processVideo(videoId, s3Key, bucket).catch((err) =>
    console.error("Background processing failed:", err)
  );
});

app.listen(config.port, () => {
  console.log(`Processor listening on port ${config.port}`);
});
