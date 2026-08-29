import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import { getAllMedia, superAdminDeleteMedia } from "../controllers/adminController.js";

const router = express.Router();

router.get("/media", protectRoute, getAllMedia);
router.delete("/media/delete", protectRoute, superAdminDeleteMedia);

export default router;