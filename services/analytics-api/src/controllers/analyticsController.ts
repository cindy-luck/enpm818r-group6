import { Request, Response } from "express";
import { query } from "../config/db";

// POST /api/analytics/view
export const incrementView = async (req: Request, res: Response) => {
  const { videoId } = req.body;

  if (!videoId) {
    return res.status(400).json({ error: "Missing videoId" });
  }

  try {
    const sql = `
      UPDATE video_analytics 
      SET views_count = views_count + 1, last_updated = NOW()
      WHERE video_id = $1
      RETURNING views_count;
    `;
    const result = await query(sql, [videoId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Video not found" });
    }

    res.json({
      message: "View count updated",
      views: result.rows[0].views_count,
    });
  } catch (error) {
    console.error("Error updating view count:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// POST /api/analytics/like
export const incrementLike = async (req: Request, res: Response) => {
  const { videoId } = req.body;

  if (!videoId) {
    return res.status(400).json({ error: "Missing videoId" });
  }

  try {
    const sql = `
      UPDATE video_analytics 
      SET likes_count = likes_count + 1, last_updated = NOW()
      WHERE video_id = $1
      RETURNING likes_count;
    `;
    const result = await query(sql, [videoId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Video not found" });
    }

    res.json({
      message: "Like count updated",
      likes: result.rows[0].likes_count,
    });
  } catch (error) {
    console.error("Error updating like count:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// GET /api/analytics/:videoId (Optional, to fetch current stats)
export const getStats = async (req: Request, res: Response) => {
  const { videoId } = req.params;
  try {
    const result = await query(
      "SELECT * FROM video_analytics WHERE video_id = $1",
      [videoId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Video not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
