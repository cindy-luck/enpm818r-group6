import { Router } from "express";
import {
  incrementView,
  incrementLike,
  getStats,
} from "../controllers/analyticsController";

const router = Router();

router.post("/view", incrementView);
router.post("/like", incrementLike);
router.get("/:videoId", getStats);

export default router;
