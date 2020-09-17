const mongoose = require("mongoose");
const fs = require("fs");
const Jimp = require("jimp");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const linkify = require("linkifyjs");

const Post = require("../models/postModel");
const User = require("../models/userModel");
const Notification = require("../models/notificationModel");
const PostLike = require("../models/postLikeModel");
const Comment = require("../models/commentModel");

const notificationHandle = require("../handlers/notificationHandler");

require("linkifyjs/plugins/hashtag")(linkify);
require("linkifyjs/plugins/mention")(linkify);

const postLookup = [
	{
		$lookup: {
			from: "users",
			localField: "author",
			foreignField: "_id",
			as: "author",
		},
	},
	{
		$lookup: {
			from: "postlikes",
			localField: "_id",
			foreignField: "post",
			as: "likes",
		},
	},
	{
		$lookup: {
			from: "comments",
			localField: "_id",
			foreignField: "post",
			as: "comments",
		},
	},
];

const checkFileType = (file, cb) => {
	const fileTypes = /jpeg|jpg|png|gif/;
	const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
	const mimetype = fileTypes.test(file.mimetype);

	if (mimetype && extname) {
		return cb(null, true);
	} else {
		cb(new Error("Chỉ cho phép đăng tải hình ảnh"));
	}
};

const arrayRemove = (array, value) => {
	return array.filter((item) => {
		return item._id.toString() !== value.toString();
	});
};

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "./server/public/images/post-images/");
	},
	filename: (req, file, cb) => {
		const ext = file.mimetype.split("/")[1];
		cb(null, uuidv4() + "." + ext);
	},
});

const upload = multer({
	storage,
	fileFilter: (req, file, cb) => {
		checkFileType(file, cb);
	},
	limits: {
		fileSize: 10485760,
	},
}).single("photo");

exports.upload = async (req, res, next) => {
	upload(req, res, (err) => {
		if (err) return res.status(400).json({ message: err.message });

		if (!req.file)
			return res.status(400).json({ message: "Vui lòng nhập hình ảnh" });

		req.body.photo = req.file.filename;
		Jimp.read(req.file.path, (err, test) => {
			if (err) throw err;
			test
				.scaleToFit(480, Jimp.AUTO, Jimp.RESIZE_BEZIER)
				.quality(50)
				.write("./server/public/images/post-images/thumbnail" + req.body.photo);
			next();
		});
	});
};

exports.createPost = async (req, res) => {
	const hashtags = linkify // find hashtags
		.find(req.body.description)
		.filter((link) => {
			if (link.type === "hashtag") {
				return link.value.substring(1);
			}
		})
		.map((hashtag) => hashtag.value.substring(1));

	const mentions = linkify // find mentions
		.find(req.body.description)
		.filter((link) => {
			if (link.type === "mention") {
				return link.value.substring(1);
			}
		})
		.map((hashtag) => hashtag.value.substring(1));

	const tags = JSON.parse(req.body.tags).map((tag) => tag);

	const uniqueUsernames = [...new Set([...mentions, ...tags])];

	let newPost;
	if (req.body.coordinates) {
		const coordinates = req.body.coordinates
			.split(",")
			.map((x) => parseFloat(x));
		newPost = new Post({
			author: req.userData.userId,
			description: req.body.description,
			photo: req.body.photo,
			hashtags: [...new Set(hashtags)], // remove duplicates
			location: {
				type: "Point",
				coordinates: coordinates,
				address: req.body.locationName,
			},
			tags: JSON.parse(req.body.tags),
		});
	} else {
		console.log("hashtags: ", [...new Set(hashtags)]);
		newPost = new Post({
			author: req.userData.userId,
			description: req.body.description,
			photo: req.body.photo,
			hashTags: [...new Set(hashtags)], // remove duplicates
			tags: JSON.parse(req.body.tags),
		});
	}

	try {
		const post = await newPost.save();
		const userId = await User.find({
			username: { $in: uniqueUsernames },
		}).select("_id");

		const removedUserId = arrayRemove(userId, req.userData.userId);
		if (removedUserId.length) {
			const notify = new Notification({
				sender: req.userData.userId,
				receiver: removedUserId,
				type: "post_tagged",
				post: post._id,
			});
			const saveNotify = await notify.save();
			const notification = await saveNotify
				.populate("post", "photo")
				.execPopulate();
			console.log("notify", notification);
			console.log("notify1", notification.toObject());
			const user = await User.findById(req.userData.userId).select(
				"profilePicture username"
			);
			notificationHandle.sendCommentTaggedNotification({
				req,
				removedUserId,
				user,
				notification: notification.toObject(),
			});
		}
		await new PostLike({
			post: post._id,
		}).save();

		const data = {
			...post.toObject(),
			author: [
				{ username: req.userData.username, profilePicture: "person.png" },
			],
			likes: 0,
			comments: 0,
		};

		res.status(200).json({ post: data });
	} catch (error) {
		console.log(error);
		res.status(400).json({ message: error.message });
	}
};

exports.likePost = async (req, res) => {
	try {
		const document = await PostLike.updateOne(
			{
				post: req.body.postId,
				"users_likes.author": { $ne: req.userData.userId },
			},
			{
				$addToSet: { users_likes: { author: req.userData.userId } },
			}
		);
		console.log("document:", document);
		if (document.nModified === 1) {
			console.log("liked");
			let notification;
			if (req.userData.userId !== req.body.userId) {
				notification = new Notification({
					sender: req.userData.userId,
					receiver: req.body.authorId,
					type: "like_post",
					post: req.body.postId,
				})
					.save()
					.then((notification) => {
						return notification.populate("post", "photo").execPopulate();
					})
					.then((notification) => {
						return notification.toObject();
					});
			}

			const user = User.findByIdAndUpdate(
				req.userData.userId,
				{ $push: { postLikes: { post: req.body.postId } } },
				{ new: true, upsert: true }
			).select("profilePicture username");

			Promise.all([user, notification])
				.then((values) => {
					notificationHandle.sendLikePostNotification(req, values);
					return res
						.status(200)
						.json({ postId: req.body.postId, action: "Đã thích" });
				})
				.catch((err) => console.log(err));
		} else {
			console.log("unlike");
			const postLike = PostLike.updateOne(
				{ post: req.body.postId },
				{
					$pull: { users_likes: { author: req.userData.userId } },
				}
			);

			const user = User.findByIdAndUpdate(req.userData.userId, {
				$pull: { postLikes: { post: req.body.postId } },
			});

			Promise.all([postLike, user])
				.then((values) => {
					return res
						.status(200)
						.json({ postId: req.body.postId, action: "Không thích nữa" });
				})
				.catch((err) => console.log(err));
		}
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

exports.deletePhotoPost = ({ photo }) => {
	fs.unlink("./server/public/images/post-images/" + photo, (err) => {
		if (err) {
			console.error(err);
			return;
		}
		console.log("Đã xóa ảnh");
	});
};

exports.deletePost = async (req, res) => {
	try {
		const post = await Post.findOneAndDelete({
			_id: req.body.postId,
			author: req.userData.userId,
		});

		if (!post)
			return res.status(404).json({ message: "Không thể thực hiện xóa bài" });

		this.deletePhotoPost(post);

		await Comment.deleteMany({
			post: post._id,
		});

		await PostLike.findOneAndDelete({
			post: post._id,
		});

		await Notification.deleteMany({
			post: post._id,
		});
		return res.status(200).json({ message: "Đã xóa bài viết", id: post._id });
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

exports.getPosts = async (req, res) => {
	let query;

	if (req.body.initialFetch) {
		query = [
			{
				$facet: {
					posts: [
						{
							$match: {
								author: { $in: req.body.followings },
							},
						},
						{ $sort: { createdAt: -1 } },
						{ $limit: 5 },
						...postLookup,

						{
							$project: {
								photo: 1,
								createdAt: 1,
								tags: 1,
								hashtags: 1,
								location: 1,
								likes: {
									$size: { $arrayElemAt: ["$likes.users_likes", 0] },
								},
								comments: {
									$size: "$comments",
								},
								description: 1,
								"author._id": 1,
								"author.username": 1,
								"author.profilePicture": 1,
							},
						},
					],
					total: [
						// Filter out documents without a price e.g., _id: 7
						{
							$match: {
								author: { $in: req.body.followings },
							},
						},
						{ $group: { _id: null, count: { $sum: 1 } } },
					],
				},
			},
		];
	} else {
		query = [
			{
				$match: {
					$and: [
						{
							_id: {
								$lt: mongoose.Types.ObjectId(req.body.lastId),
							},
							author: { $in: req.body.followings },
						},
					],
				},
			},
			{ $sort: { createdAt: -1 } },
			{ $limit: 5 },
			...postLookup,

			{
				$project: {
					photo: 1,
					createdAt: 1,
					tags: 1,
					hashtags: 1,
					location: 1,
					likes: {
						$size: { $arrayElemAt: ["$likes.users_likes", 0] },
					},
					comments: {
						$size: "$comments",
					},
					description: 1,
					"author._id": 1,
					"author.username": 1,
					"author.profilePicture": 1,
				},
			},
		];
	}

	Post.aggregate(query)
		.then((data) => {
			console.log("data", data);
			if (req.body.initialFetch && !data[0].total.length) {
				data[0].total.push({ _id: null, count: 0 }); //if user has no posts
			}

			res.status(200).json({ data });
		})
		.catch((err) => {
			console.log(err.message);
			res.status(500).json({ message: err.message });
		});
};

exports.getPost = async (req, res) => {
	try {
		const post = await Post.aggregate([
			{ $match: { _id: mongoose.Types.ObjectId(req.body.postId) } },
			...postLookup,
			{
				$project: {
					photo: 1,
					createAt: 1,
					tags: 1,
					location: 1,
					likes: {
						$size: { $arrayElemAt: ["$likes.users_likes", 0] },
					},
					comments: {
						$size: "$comments",
					},
					description: 1,
					"author._id": 1,
					"author.username": 1,
					"author.profilePicture": 1,
				},
			},
		]);

		if (!post.length) {
			return res.status(404).json({ message: "Không tìm thấy bài viết" });
		}

		res.status(200).json({ post });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

exports.getPostByHashtag = async (req, res) => {
	let query;

	if (req.body.initialFetch) {
		query = [
			{
				$facet: {
					posts: [
						{
							$match: {
								hashTags: req.body.hashTag,
							},
						},
						{ $sort: { createAt: -1 } },
						{ $limit: 10 },
						...postLookup,
						{
							$project: {
								photo: 1,
								createdAt: 1,
								tags: 1,
								hashtags: 1,
								location: 1,
								likes: {
									$size: { $arrayElemAt: ["$likes.users_likes", 0] },
								},
								comments: {
									$size: "$comments",
								},
								description: 1,
								"author._id": 1,
								"author.username": 1,
								"author.profilePicture": 1,
							},
						},
					],
					total: [
						{
							$match: {
								hashTags: req.body.hashTag,
							},
						},
						{ $group: { _id: null, count: { $sum: 1 } } },
					],
				},
			},
		];
	} else {
		query = [
			{
				$match: {
					$and: [
						{
							_id: {
								$lt: mongoose.Types.ObjectId(req.body.lastId),
							},
							hashtags: req.body.hashtag,
						},
					],
				},
			},
			{ $sort: { createdAt: -1 } },
			{ $limit: 10 },
			...postLookup,

			{
				$project: {
					photo: 1,
					createdAt: 1,
					tags: 1,
					hashtags: 1,
					location: 1,
					likes: {
						$size: { $arrayElemAt: ["$likes.users_likes", 0] },
					},
					comments: {
						$size: "$comments",
					},
					description: 1,
					"author._id": 1,
					"author.username": 1,
					"author.profilePicture": 1,
				},
			},
		];
	}

	try {
		const data = await Post.aggregate(query);
		const { posts } = data[0];
		if (!posts.length) {
			return res.status(404).json({ message: "Hashtag không tìm thấy" });
		}

		return res.status(200).json({ data });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

exports.getPostsByLocation = async (req, res) => {
	const [lat, lng] = req.body.coordinates.split(",");

	let query;

	if (req.body.initialFetch) {
		query = [
			{
				$facet: {
					posts: [
						{
							$match: {
								"location.coordinates": [parseFloat(lat), parseFloat(lng)],
							},
						},
						{ $sort: { createdAt: -1 } },
						{ $limit: 10 },
						...postLookup,

						{
							$project: {
								photo: 1,
								createdAt: 1,
								tags: 1,
								hashtags: 1,
								location: 1,
								likes: {
									$size: { $arrayElemAt: ["$likes.users_likes", 0] },
								},
								comments: {
									$size: "$comments",
								},
								description: 1,
								"author._id": 1,
								"author.username": 1,
								"author.profilePicture": 1,
							},
						},
					],
					total: [
						{
							$match: {
								"location.coordinates": [parseFloat(lat), parseFloat(lng)],
							},
						},
						{ $group: { _id: null, count: { $sum: 1 } } },
					],
				},
			},
		];
	} else {
		query = [
			{
				$match: {
					$and: [
						{
							_id: {
								$lt: mongoose.Types.ObjectId(req.body.lastId),
							},
							"location.coordinates": [parseFloat(lat), parseFloat(lng)],
						},
					],
				},
			},
			{ $sort: { createdAt: -1 } },
			{ $limit: 10 },
			...postLookup,

			{
				$project: {
					photo: 1,
					createdAt: 1,
					tags: 1,
					hashtags: 1,
					location: 1,
					likes: {
						$size: { $arrayElemAt: ["$likes.users_likes", 0] },
					},
					comments: {
						$size: "$comments",
					},
					description: 1,
					"author._id": 1,
					"author.username": 1,
					"author.profilePicture": 1,
				},
			},
		];
	}

	try {
		const data = await Post.aggregate(query);
		const { posts } = data[0];
		if (!posts.length) {
			return res
				.status(404)
				.json({ message: "Không tìm thấy bài viết theo vị trí" });
		}
		return res.status(200).json({ data });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

exports.getPostLike = async (req, res) => {
	try {
		const users = await PostLike.find({ post: req.body.postId })
			.populate("users_likes.author", "username profilePicture")
			.select("author");
		res.status(200).json({ users });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
