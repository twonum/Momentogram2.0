import express from "express";
import {
	createPost,
	deletePost,
	getPost,
	likeUnlikePost,
	replyToPost,
	getFeedPosts,
	getUserPosts,
	deleteAnyPost, // Imported the new admin controller
} from "../controllers/postController.js";
import protectRoute from "../middlewares/protectRoute.js";
import requireAdmin from "../middlewares/requireAdmin.js"; // Imported the admin middleware

const router = express.Router();

router.get("/feed", protectRoute, getFeedPosts);
router.get("/user/:username", getUserPosts);
router.get("/:id", getPost);
router.post("/create", protectRoute, createPost);

// Admin route strictly placed before standard dynamic routes
router.delete("/admin/delete/:id", protectRoute, requireAdmin, deleteAnyPost);

router.delete("/:id", protectRoute, deletePost);
router.put("/like/:id", protectRoute, likeUnlikePost);
router.put("/reply/:id", protectRoute, replyToPost);

export default router;