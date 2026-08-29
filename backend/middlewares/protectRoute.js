import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

const protectRoute = async (req, res, next) => {
	try {
		const token = req.cookies.jwt;

		if (!token) {
			return res.status(401).json({ error: "Unauthorized - No Token Provided" });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId).select("-password");

		if (!user) {
			// User was deleted by an administrator; clear cookie and reject session
			res.cookie("jwt", "", { maxAge: 1 });
			return res.status(401).json({ error: "Your account has been deleted by an administrator. You have been signed out." });
		}

		req.user = user;
		next();
	} catch (error) {
		res.status(401).json({ error: "Not authorized, token failed" });
	}
};

export default protectRoute;