import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import { getRecipientSocketId, io } from "../socket/socket.js";
import { v2 as cloudinary } from "cloudinary";

async function sendMessage(req, res) {
	try {
		const { recipientId, message } = req.body;
		let { img } = req.body;
		const senderId = req.user._id;

		let conversation = await Conversation.findOne({
			participants: { $all: [senderId, recipientId] },
		});

		if (!conversation) {
			conversation = new Conversation({
				participants: [senderId, recipientId],
				lastMessage: {
					text: message,
					sender: senderId,
				},
			});
			await conversation.save();
		}

		if (img) {
			const uploadedResponse = await cloudinary.uploader.upload(img, { resource_type: "auto" });
			img = uploadedResponse.secure_url;
		}

		const newMessage = new Message({
			conversationId: conversation._id,
			sender: senderId,
			text: message,
			img: img || "",
		});

		await Promise.all([
			newMessage.save(),
			conversation.updateOne({
				lastMessage: {
					text: message,
					sender: senderId,
				},
			}),
		]);

		const recipientSocketId = getRecipientSocketId(recipientId);
		if (recipientSocketId) {
			io.to(recipientSocketId).emit("newMessage", newMessage);
		}

		res.status(201).json(newMessage);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

const getMessages = async (req, res) => {
	const { otherUserId } = req.params;
	const userId = req.user._id;

	// Prevent crashing if undefined is passed in the URL route
	if (!otherUserId || otherUserId === "undefined") {
		return res.status(400).json({ error: "Invalid recipient user ID" });
	}

	try {
		const conversation = await Conversation.findOne({
			participants: { $all: [userId, otherUserId] },
		});

		if (!conversation) {
			return res.status(200).json([]); // Return empty array instead of failing
		}

		const messages = await Message.find({
			conversationId: conversation._id,
		}).sort({ createdAt: 1 });

		res.status(200).json(messages);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

async function getConversations(req, res) {
	const userId = req.user._id;
	try {
		const conversations = await Conversation.find({ participants: userId }).populate({
			path: "participants",
			select: "username profilePic",
		});

		// remove the current user from the participants array
		conversations.forEach((conversation) => {
			conversation.participants = conversation.participants.filter(
				(participant) => participant._id.toString() !== userId.toString()
			);
		});
		res.status(200).json(conversations);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

const deleteMessage = async (req, res) => {
	try {
		const { messageId } = req.params;
		const message = await Message.findById(messageId);
		if (!message) return res.status(404).json({ error: "Message not found" });

		// Ensure user is the sender
		if (message.sender.toString() !== req.user._id.toString()) {
			return res.status(401).json({ error: "Unauthorized to delete this message" });
		}

		// STRICT MEDIA LOCKDOWN: Prevent normal users from deleting photos or videos
		if (message.img && message.img.trim() !== "" && req.user.role !== "superadmin") {
			return res.status(403).json({ error: "Forbidden: Only Super Admins can delete media files." });
		}

		await Message.findByIdAndDelete(messageId);
		res.status(200).json({ message: "Message deleted successfully", messageId });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};


const deleteConversation = async (req, res) => {
	try {
		const { conversationId } = req.params;
		const conversation = await Conversation.findById(conversationId);
		if (!conversation) return res.status(404).json({ error: "Conversation not found" });

		// Verify participant
		if (!conversation.participants.includes(req.user._id)) {
			return res.status(401).json({ error: "Unauthorized" });
		}

		await Message.deleteMany({ conversationId });
		await Conversation.findByIdAndDelete(conversationId);

		res.status(200).json({ message: "Conversation deleted successfully", conversationId });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
export { sendMessage, getMessages, getConversations, deleteMessage, deleteConversation };
