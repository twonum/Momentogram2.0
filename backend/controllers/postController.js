import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js"; // IMPORT NOTIFICATIONS
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
	try {
		const { postedBy, text } = req.body;
		let { img } = req.body;

		if (!postedBy || !text) return res.status(400).json({ error: "Postedby and text fields are required" });

		const user = await User.findById(postedBy);
		if (!user) return res.status(404).json({ error: "User not found" });

		if (user._id.toString() !== req.user._id.toString()) {
			return res.status(401).json({ error: "Unauthorized to create post" });
		}

		const maxLength = 500;
		if (text.length > maxLength) return res.status(400).json({ error: `Text must be less than ${maxLength} characters` });

		if (img) {
			const uploadedResponse = await cloudinary.uploader.upload(img, { resource_type: "auto" });
			img = uploadedResponse.secure_url;
		}

		const newPost = new Post({ postedBy, text, img });
		await newPost.save();

		res.status(201).json(newPost);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

export const getPost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id).populate("repostedBy", "username profilePic");
		if (!post) return res.status(404).json({ error: "Post not found" });

		res.status(200).json(post);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

export const deletePost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) return res.status(404).json({ error: "Post not found" });

		const isOriginalAuthor = post.postedBy.toString() === req.user._id.toString();
		const isReposter = post.repostedBy && post.repostedBy.toString() === req.user._id.toString();

		if (!isOriginalAuthor && !isReposter) return res.status(401).json({ error: "Unauthorized to delete post" });

		if (post.img && !post.repostedBy) {
			const imgId = post.img.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(imgId).catch(console.error);
		}

		await Post.findByIdAndDelete(req.params.id);
		res.status(200).json({ message: "Post deleted successfully" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

export const likeUnlikePost = async (req, res) => {
	try {
		const { id: postId } = req.params;
		const userId = req.user._id;

		const post = await Post.findById(postId);
		if (!post) return res.status(404).json({ error: "Post not found" });

		const userLikedPost = post.likes.includes(userId);

		if (userLikedPost) {
			await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
			res.status(200).json({ message: "Post unliked successfully" });
		} else {
			post.likes.push(userId);
			await post.save();

			// TRIGGER LIKE NOTIFICATION
			if (post.postedBy.toString() !== userId.toString()) {
				const notification = new Notification({ type: "like", sender: userId, recipient: post.postedBy });
				await notification.save();
			}
			res.status(200).json({ message: "Post liked successfully" });
		}
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

export const replyToPost = async (req, res) => {
	try {
		const { text } = req.body;
		const postId = req.params.id;
		const userId = req.user._id;
		const userProfilePic = req.user.profilePic;
		const username = req.user.username;

		if (!text) return res.status(400).json({ error: "Text field is required" });

		const post = await Post.findById(postId);
		if (!post) return res.status(404).json({ error: "Post not found" });

		const reply = { userId, text, userProfilePic, username };
		post.replies.push(reply);
		await post.save();

		// TRIGGER REPLY NOTIFICATION
		if (post.postedBy.toString() !== userId.toString()) {
			const notification = new Notification({ type: "reply", sender: userId, recipient: post.postedBy });
			await notification.save();
		}

		res.status(200).json(reply);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

export const repostPost = async (req, res) => {
	try {
		const { id: postId } = req.params;
		const userId = req.user._id;

		const originalPost = await Post.findById(postId);
		if (!originalPost) return res.status(404).json({ error: "Post not found" });

		const newPost = new Post({
			postedBy: originalPost.postedBy,
			text: originalPost.text,
			img: originalPost.img,
			repostedFrom: originalPost._id,
			repostedBy: userId,
		});

		await newPost.save();
		await newPost.populate("repostedBy", "username profilePic");

		// TRIGGER REPOST NOTIFICATION
		if (originalPost.postedBy.toString() !== userId.toString()) {
			const notification = new Notification({ type: "repost", sender: userId, recipient: originalPost.postedBy });
			await notification.save();
		}

		res.status(201).json(newPost);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export const getFeedPosts = async (req, res) => {
	try {
		const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const following = user.following;

		const feedPosts = await Post.find({
			$or: [
				{ postedBy: { $in: following } },
				{ postedBy: userId },
				{ repostedBy: { $in: following } },
				{ repostedBy: userId }
			]
		})
			.sort({ createdAt: -1 })
			.populate("repostedBy", "username profilePic");

		if (feedPosts.length === 0) {
			const generalPosts = await Post.find({})
				.sort({ createdAt: -1 })
				.limit(20)
				.populate("repostedBy", "username profilePic");
			return res.status(200).json(generalPosts);
		}

		res.status(200).json(feedPosts);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export const getUserPosts = async (req, res) => {
	const { username } = req.params;
	try {
		const user = await User.findOne({ username });
		if (!user) return res.status(404).json({ error: "User not found" });

		const posts = await Post.find({
			$or: [
				{ postedBy: user._id },
				{ repostedBy: user._id },
				{ "replies.userId": user._id }
			]
		})
			.sort({ createdAt: -1 })
			.populate("repostedBy", "username profilePic");

		res.status(200).json(posts);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export const deleteAnyPost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) return res.status(404).json({ error: "Post not found" });

		await Post.findByIdAndDelete(req.params.id);
		res.status(200).json({ message: "Post forcefully deleted by Admin" });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};