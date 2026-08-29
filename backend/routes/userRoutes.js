import express from "express";
import {
	followUnFollowUser,
	getUserProfile,
	loginUser,
	logoutUser,
	signupUser,
	updateUser,
	getSuggestedUsers,
	freezeAccount,
	getAllUsers,
	deleteAnyUser,
	searchUser,
	getUsersByIds,
	toggleAdminMods
} from "../controllers/userController.js";
import protectRoute from "../middlewares/protectRoute.js";
import requireAdmin from "../middlewares/requireAdmin.js";

const router = express.Router();

router.get("/profile/:query", getUserProfile);
router.get("/search/:query", protectRoute, searchUser);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.post("/list", protectRoute, getUsersByIds); // Added route for Followers/Following modals
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/follow/:id", protectRoute, followUnFollowUser);
router.put("/update/:id", protectRoute, updateUser);
router.put("/freeze", protectRoute, freezeAccount);

// Admin Routes
router.get("/admin/users", protectRoute, requireAdmin, getAllUsers);
router.delete("/admin/delete/:id", protectRoute, requireAdmin, deleteAnyUser);
// Add this line under your Admin Routes section:
router.put("/admin/toggle-mods", protectRoute, requireAdmin, toggleAdminMods);

export default router;