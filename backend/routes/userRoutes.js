import express from "express";
import {
	followUnFollowUser,
	getUserProfile,
	loginUser,
	logoutUser,
	signupUser,
	toggleAdminMods,
	updateUser,
	getSuggestedUsers,
	freezeAccount,
	getAllUsers,
	deleteAnyUser
} from "../controllers/userController.js";
import protectRoute from "../middlewares/protectRoute.js";
import requireAdmin from "../middlewares/requireAdmin.js";

const router = express.Router();

router.get("/profile/:query", getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/follow/:id", protectRoute, followUnFollowUser);
router.put("/update/:id", protectRoute, updateUser);
router.put("/freeze", protectRoute, freezeAccount);

// Admin Routes
router.get("/admin/users", protectRoute, requireAdmin, getAllUsers);
router.delete("/admin/delete/:id", protectRoute, requireAdmin, deleteAnyUser);
router.put("/admin/toggle-mods", protectRoute, requireAdmin, toggleAdminMods);

export default router;