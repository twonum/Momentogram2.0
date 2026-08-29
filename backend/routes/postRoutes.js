import express from "express";
import {
	createPost,
	deletePost,
	getPost,
	likeUnlikePost,
	replyToPost,
	getFeedPosts,
	getUserPosts,
	repostPost,
	deleteAnyPost
} from "../controllers/postController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

router.get("/feed", protectRoute, getFeedPosts);
router.get("/:id", getPost);
router.get("/user/:username", getUserPosts);
router.post("/create", protectRoute, createPost);
router.delete("/:id", protectRoute, deletePost);
router.delete("/admin/:id", protectRoute, deleteAnyPost);
router.put("/like/:id", protectRoute, likeUnlikePost);
router.put("/reply/:id", protectRoute, replyToPost);
router.post("/repost/:id", protectRoute, repostPost);

export default router;