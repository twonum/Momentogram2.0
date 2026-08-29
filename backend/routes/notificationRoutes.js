import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import { getNotifications, markNotificationsRead } from "../controllers/notificationController.js";

const router = express.Router();
router.get("/", protectRoute, getNotifications);
router.put("/read", protectRoute, markNotificationsRead);

export default router;