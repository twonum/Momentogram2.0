import User from "../models/userModel.js";

const requireAdmin = async (req, res, next) => {
    try {
        if (!req.user || req.user.role === "user") {
            return res.status(403).json({ error: "Forbidden: Admin access required" });
        }

        // If it's a normal admin trying to modify/delete something
        if (req.user.role === "admin" && req.method !== "GET") {
            const superAdmin = await User.findOne({ role: "superadmin" });
            if (!superAdmin || !superAdmin.adminModsAllowed) {
                return res.status(403).json({ error: "Forbidden: Super Admin has disabled modifications for Admins." });
            }
        }
        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default requireAdmin;