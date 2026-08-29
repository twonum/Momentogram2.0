import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import {
    getMessages,
    sendMessage,
    getConversations,
    deleteMessage,
    deleteConversation
} from "../controllers/messageController.js";

const router = express.Router();

router.get("/conversations", protectRoute, getConversations);
router.get("/:otherUserId", protectRoute, getMessages);
router.post("/", protectRoute, sendMessage);
router.delete("/delete/:messageId", protectRoute, deleteMessage);
router.delete("/conversation/:conversationId", protectRoute, deleteConversation);

export default router;