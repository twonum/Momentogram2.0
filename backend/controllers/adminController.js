import Message from "../models/messageModel.js";
import Post from "../models/postModel.js";
import { v2 as cloudinary } from "cloudinary";

export const getAllMedia = async (req, res) => {
    try {
        if (req.user.role !== "superadmin") {
            return res.status(403).json({ error: "Forbidden: Super Admin access required" });
        }

        const messagesWithImg = await Message.find({ img: { $ne: "" } }).populate("sender", "username profilePic email");

        // Populate repostedBy to properly identify reposts in the dashboard
        const postsWithImg = await Post.find({ img: { $ne: "" } })
            .populate("postedBy", "username profilePic email")
            .populate("repostedBy", "username profilePic email");

        const formattedMedia = [
            ...messagesWithImg.map((m) => ({
                _id: m._id,
                url: m.img,
                user: m.sender,
                type: "message",
                createdAt: m.createdAt,
            })),
            ...postsWithImg.map((p) => ({
                _id: p._id,
                url: p.img,
                // Show the reposter if it's a repost, otherwise show the original author
                user: p.repostedBy || p.postedBy,
                type: p.repostedBy ? "repost" : "post",
                createdAt: p.createdAt,
            })),
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json(formattedMedia);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const superAdminDeleteMedia = async (req, res) => {
    try {
        if (req.user.role !== "superadmin") {
            return res.status(403).json({ error: "Forbidden: Super Admin access required" });
        }

        const itemsToDelete = Array.isArray(req.body.items) ? req.body.items : [req.body];

        for (const item of itemsToDelete) {
            let dbItem;
            if (item.type === "message") {
                dbItem = await Message.findById(item.id);
                if (dbItem && dbItem.img) {
                    const imgId = dbItem.img.split("/").pop().split(".")[0];
                    await cloudinary.uploader.destroy(imgId).catch(console.error);
                }
                await Message.findByIdAndDelete(item.id);
            } else {
                // This handles both "post" and "repost" types since they share the Post model
                dbItem = await Post.findById(item.id);
                if (dbItem && dbItem.img) {
                    const imgId = dbItem.img.split("/").pop().split(".")[0];
                    await cloudinary.uploader.destroy(imgId).catch(console.error);
                }
                await Post.findByIdAndDelete(item.id);
            }
        }

        res.status(200).json({ message: "Media deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};