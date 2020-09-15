const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const Jimp = require("jimp");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const uuidv4 = require("uuid");

const User = require("../models/userModel");
const Following = require("../models/followingModel");
const Follower = require("../models/followerModel");
const Notification = require("../models/notificationModel");
const Post = require("../models/postModel");
const Message = require("../models/messageModel");
const ChatRoom = require("../models/chatRoomModel");

const keys = require("../configs/keys");

const notificationHandler = require("../handlers/notificationHandler");
const emailHandler = require("../handlers/emailHandler");
const messageHandler = require("../handlers/messageHandler");

const checkFileType = (file, cb) => {
	const filetypes = /jpeg|jpg|png|gif/;
	const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
	const mimetype = filetypes.test(file.mimetype);

	if (mimetype && extname) {
		return cb(null, true);
	} else {
		cb(new Error("chỉ cho phép sử dụng hình ảnh"));
	}
};

const storage = multer.diskStorage({
	destination: (req, res, cb) => {
		cb(null, "/images/profile-picture");
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
		fileSize: 1024 * 1024,
	},
}).single("photo");

exports.upload = (req, res, next) => {
	upload(req, res, (err) => {
		if (err) return res.json({ message: err.message });

		if (!req.file)
			return res.json({ message: "Xin hãy nhập ít nhất 1 bức hình" });

		req.body.photo = req.file.filename;

		Jimp.read(req.file.path, (err, test) => {
			if (err) throw err;
			test
				.resize(100, 100)
				.quality(50)
				.write("/images/profile-picture/100x100" + req.body.photo);
			next();
		});
	});
};

const deleteProfilePicture = ({ photo }) => {
	fs.unlink("./public/images/profile-picture" + photo, (err) => {
		if (err) {
			console.log(err);
			return;
		}
		console.log("Đã xóa ảnh");
	});

	fs.unlink("./public/images/profile-picture/100x100/" + photo, (err) => {
		if (err) {
			console.log(err);
			return;
		}
		console.log("Đã xóa ảnh");
	});
};

exports.changeProfilePicture = async (req, res) => {
	try {
		const userPicture = await User.findById(req.userData.userId).select(
			"profilePicture"
		);
		if (userPicture.profilePicture !== "person.png") {
			deleteProfilePicture({ photo: userPicture.profilePicture });
		}

		const updateProfilePicture = await User.findOneAndUpdate(
			{ _id: req.userData.userId },
			{ profilePicture: req.body.photo },
			{ new: true }
		).select("profilePicture");

		return res.status(200).json({ updateProfilePicture });
	} catch (error) {
		console.log(err);
		return res.status(500).json({ message: err.message });
	}
};

exports.active = (req, res) => {
	if (keys.ENABLE_SEND_EMAIL === "false") {
		return res.status(200).header("Content-Type", "text/html")
			.send(`<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <meta name="theme-color" content="#000000">
        <style>
            .alert {
                padding: 20px;
                background-color: #f44336;
                color: white;
            }
        </style>
        <title>social-network</title>
    </head>
    
    <body>
        <div class="alert">
            <strong>Error!</strong> Disabled.
        </div>
    
    </body>
    
    </html>
  `);
	}

	try {
		const decoded = jwt.verify(req.params.token, keys.SECRET_KEY);
		console.log("pass");
		User.findByIdAndUpdate(decoded._id, {
			activated: true,
		})
			.then(() => {
				return res.status(200).header("Content-Type", "text/html")
					.send(`<!DOCTYPE html>
          <html lang="en">
      
          <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
              <meta name="theme-color" content="#000000">
              <style>
                  .alert {
                      padding: 20px;
                      background-color: #4CAF50;
                      color: white;
                  }
              </style>
              <title>The Solution</title>
          </head>
          
          <body>
              <div class="alert">
                  <strong>Success!</strong> Tài khoản đã được kích hoạt
              </div>
          
          </body>
          
          </html>
          `);
			})
			.catch((err) => {
				console.log(err);
				return res.status(401).header("Content-Type", "text/html")
					.send(`<!DOCTYPE html>
          <html lang="en">
          
          <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
              <meta name="theme-color" content="#000000">
              <style>
                  .alert {
                      padding: 20px;
                      background-color: #f44336;
                      color: white;
                  }
              </style>
              <title>The Solution</title>
          </head>
          
          <body>
              <div class="alert">
                  <strong>Error!</strong> Có lỗi xảy ra
              </div>
          
          </body>
          
          </html>
        `);
			});
	} catch (error) {
		return res.status(401).header("Content-Type", "text/html")
			.send(`<!DOCTYPE html>
      <html lang="en">
      
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
          <meta name="theme-color" content="#000000">
          <style>
              .alert {
                  padding: 20px;
                  background-color: #f44336;
                  color: white;
              }
          </style>
          <title>The Solution</title>
      </head>
      
      <body>
          <div class="alert">
              <strong>Error!</strong> Token không hợp lệ
          </div>
      
      </body>
      
      </html>
    `);
	}
};

exports.addUser = (req, res) => {
	User.findOne({
		$or: [{ email: req.body.email }, { username: req.body.user }],
	}).then((user) => {
		if (!user) {
			bcrypt.hash(req.body.password, 10, (err, hash) => {
				if (err) {
					res.status(500).json({ message: err.message });
				} else {
					const user = new User({
						email: req.body.email,
						firstName: req.body.firstName,
						lastName: req.body.lastName,
						username: req.body.username,
						password: hash,
					});

					user
						.save()
						.then((user) => {
							notificationHandler.sendNewUser({ req, user });
							const following = new Following({ user: user._id }).save();
							const follower = new Follower({ user: user._id }).save();
							Promise.all([following, follower]).then(() => {
								if (keys.ENABLE_SEND_EMAIL === "true") {
									emailHandler.sendVerificationEmail({
										email: user.email,
										_id: user._id,
										username: user.username,
									});
									return res.status(201).json({
										message: "Hãy xác thực tài khoản qua Email bạn vừa đăng ký",
									});
								} else {
									return res.status(201).json({
										message: "Đăng ký tài khoản thành công",
									});
								}
							});
						})
						.catch((err) => {
							return res.status(500).json({ message: err.message });
						});
				}
			});
		} else {
			if (user.username === req.body.username) {
				return res.status(409).json({
					message: "Tài khoản đã tồn tại",
				});
			}
			if (user.email === req.body.email) {
				return res.status(409).json({
					message: "Email đã tồn tại",
				});
			}
		}
	});
};

exports.resetPassword = (req, res) => {
	bcrypt.hash(req.body.password, 10, async (err, hash) => {
		try {
			await User.findOneAndUpdate(
				{ email: req.userData.email },
				{ password: hash }
			);
			return res.status(200).json({ message: "Mật khẩu đã được thay đổi" });
		} catch (error) {
			return res.status(500).json({ message: error.message });
		}
	});
};

exports.sendVerificationEmail = async (req, res) => {
	try {
		const user = await User.findOne({
			email: req.body.email,
			activated: false,
		}).select("email username");
		emailHandler.sendVerificationEmail(user);
		return res
			.status(200)
			.json({ message: "Đã gửi xác thực qua Email của bạn" });
	} catch (error) {
		return res.status(400).json({ message: "Vui lòng thử lại" });
	}
};

exports.sendForgotPasswordEmail = async (req, res) => {
	console.log(req.body);
	const user = await User.findOne({ email: req.body.email }).select(
		"email username"
	);
	if (user) {
		emailHandler.sendPasswordResetEmail(user);
		return res.status(200).json({ message: "Đã gửi lại mật khẩu qua Email" });
	}
	return res.status(400).json({ message: "Email này không tồn tại" });
};

exports.loginUser = async (req, res, next) => {
	User.aggregate([
		{
			$match: {
				$or: [{ email: req.body.email }, { username: req.body.email }],
			},
		},
		{
			$project: {
				_id: 1,
				username: 1,
				email: 1,
				password: 1,
			},
		},
	])
		.then(async (users) => {
			if (users.length < 1) {
				return res
					.status(400)
					.json({ message: "Email hoặc Tài khoản không tồn tại " });
			} else {
				const decodedPassword = await bcrypt.compare(
					req.body.password,
					users[0].password
				);

				if (decodedPassword) {
					const token = jwt.sign(
						{
							email: users[0].email,
							userId: users[0]._id,
							username: users[0].username,
						},
						keys.SECRET_KEY,
						{
							expiresIn: "300h",
						}
					);

					const user = {
						_id: users[0]._id,
						token: "Bearer " + token,
					};
					req.body.user = user;
					next();
					return;
				}

				console.log("pass");
				return res.status(400).json({ message: "Sai mật khẩu" });
			}
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({ message: err });
		});
};

exports.sendUserData = (req, res) => {
	console.log("sendUserData.Controller");
	return res.status(200).json({ user: req.body.user });
};

exports.deleteUser = async (req, res) => {
	try {
		await User.remove({ _id: req.userData.userId });
		res.status(200).json({ message: "Xóa tài khoản thành công" });
	} catch (error) {
		res.status(500).json({ error });
	}
};

exports.updateUser = async (req, res) => {
	const user = await User.find({
		$and: [
			{ $or: [{ email: req.body.email }, { username: req.body.username }] },
			{ _id: { $ne: req.userData.userId } },
		],
	}).select("username email");

	if (user.length) {
		const { username, email } = user[0];

		if (username === req.body.name) {
			return res.status(409).json({ message: "Tên tài khoản này đã tồn tại" });
		}

		if (email === req.body.email) {
			return res.status(409).json({ message: "Email này đã tồn tại" });
		}
	}

	const updateUser = await User.findByIdAndUpdate(
		req.userData.userId,
		{ ...req.body },
		{ new: true }
	).select("firstName LastName username email bio");

	try {
		const token = jwt.sign(
			{
				email: updateUser.email,
				userId: updateUser._id,
				username: updateUser.username,
			},
			keys.SECRET_KEY,
			{
				expiresIn: "300h",
			}
		);

		return res.status(200).json({ user: updateUser, token: "Bearer " + token });
	} catch (error) {
		console.log(err);
		return res.status(500).json({ message: err });
	}
};

exports.getUserData = (req, res, next) => {
	let q;
	console.log(req.body.profilePage == true);
	if (req.body.profilePage === "true") {
		q = [
			{ $match: { _id: mongoose.Types.ObjectId(req.userData.userId) } },
			{
				$lookup: {
					from: "followings",
					localField: "_id",
					foreignField: "user",
					as: "followings",
				},
			},
			{
				$lookup: {
					from: "followers",
					localField: "_id",
					foreignField: "user",
					as: "followers",
				},
			},
			{
				$project: {
					firstName: 1,
					lastName: 1,
					username: 1,
					email: 1,
					bio: 1,
					profilePicture: 1,
					followings: {
						$size: { $arrayElemAt: ["$followings.followings", 0] },
					},
					followers: {
						$size: { $arrayElemAt: ["$followers.followers", 0] },
					},
					postLikes: "$postLike.post",
					commentLikes: "$commentLike.comment",
					commentReplyLikes: "$commentReplyLike.comment",
				},
			},
		];
	} else {
		q = [
			{ $match: { _id: mongoose.Types.ObjectId(req.userData.userId) } },
			{
				$lookup: {
					from: "followings",
					localField: "_id",
					foreignField: "user",
					as: "followings",
				},
			},
			{
				$project: {
					firstName: 1,
					lastName: 1,
					username: 1,
					profilePicture: 1,
					followingIds: { $arrayElemAt: ["$followings.followings.user", 0] },
					postLikes: "$postLikes.post",
					commentLikes: "$commentLikes.comment",
					commentReplyLikes: "$commentReplyLikes.comment",
				},
			},
		];
	}
	const notification = Notification.find({
		receiver: mongoose.Types.ObjectId(req.userData.userId),
		read: false,
	}).countDocuments();

	const allNotification = Notification.find({
		receiver: mongoose.Types.ObjectId(req.userData.userId),
	});

	const posts = Post.find({
		author: mongoose.Types.ObjectId(req.userData.userId),
	});

	const messages = Message.find({
		receiver: mongoose.Types.ObjectId(req.userData.userId),
		read: false,
	}).countDocuments();

	const user = User.aggregate(q);

	Promise.all([user, notification, posts, messages, allNotification])
		.then((values) => {
			const user = values[0];
			if (user.length < 1) {
				return res.status(404).json({
					message: "Không tìm thấy người dùng",
				});
			}

			const data = {
				...user[0],
				notificationCount: values[1],
				postsCount: values[2],
				messagesCount: values[3],
				allNotification: values[4],
			};

			req.body.user = data;
			next();
		})
		.catch((err) => {
			return res.status(500).json({
				message: err.message,
			});
		});
};

exports.followUser = async (req, res) => {
	try {
		const room = await ChatRoom.find({
			members: { $all: [req.userData.userId, req.body.userId] },
		});
		if (!room.length) {
			const newRoom = new ChatRoom({
				members: [req.body.userId, req.userData.userId],
			});
			const saveRoom = await newRoom.save();
			const finalRoom = await saveRoom
				.populate(
					"member",
					"username firstName lastName profilePicture activityStatus"
				)
				.execPopulate();
			messageHandler.sendRoom(req, {
				userId: req.body.userId,
				room: finalRoom.toObject(),
			});
		}
	} catch (error) {
		return res.status(500).json({
			message: err.message,
		});
	}

	if (req.userData.userId !== req.body.userId) {
		try {
			const document = await Following.updateOne(
				{
					user: req.userData.userId,
					"followings.user": { $ne: req.body.userId },
				},
				{
					$addToSet: { followings: { user: req.body.userId } },
				}
			);

			if (document.nModified === 1) {
				console.log(document.nModified);
				const notification = new Notification({
					sender: req.userData.userId,
					message: "Theo dõi bạn",
					receiver: req.body.userId,
					type: "follow",
				}).save();

				const followers = Follower.updateOne(
					{
						user: req.body.userId,
					},
					{
						$push: { followers: { user: req.userData.userId } },
					}
				);

				const user = User.findById(req.userData.userId).select(
					"username profilePicture"
				);

				Promise.all([user, notification, followers])
					.then((values) => {
						notificationHandler.sendFollowNotification(req, values);
						return res.status(200).json({
							userId: req.body.userId,
							action: "Followed",
						});
					})
					.catch((err) => console.log(err));
			} else {
				const following = Following.updateOne(
					{
						user: req.userData.userId,
					},
					{
						$pull: { followings: { user: req.body.userId } },
					}
				);

				const follower = Follower.updateOne(
					{
						user: req.body.userId,
					},
					{
						$pull: { followers: { user: req.userData.userId } },
					}
				);

				Promise.all([following, follower])
					.then(() => {
						res.status(200).json({
							userId: req.body.userId,
							action: "unfollowed",
						});
					})
					.catch((err) => console.log(err));
			}
		} catch (error) {
			return res.status(500).json({ message: error });
		}
	} else {
		return res.status(403).json({ message: "Theo dõi thất bại" });
	}
};

exports.getNewUsers = async (req, res) => {
	if (req.body.initialFetch === "true") {
		const userCount = User.find({}).countDocuments();
		const users = User.find()
			.select("username date profilePicture")
			.sort({ date: -1 })
			.limit(30);

		Promise.all([userCount, users])
			.then((response) => {
				const [userCount, users] = response;
				return res.status(200).json({ userCount, users });
			})
			.catch((err) => {
				res.status(500).json({ message: err.message });
			});
	} else {
		try {
			const users = await User.find({ _id: req.body.lastId })
				.select("username date profilePicture")
				.sort({ date: -1 })
				.limit(30);
			res.status(200).json({ users });
		} catch (error) {
			res.status(500).json({ message: err.message });
		}
	}
};

exports.getUserProfileData = async (req, res, next) => {
	if (req.userData.username === req.body.username) {
		return res.status(200).json({ user: { loggedInUser: true } });
	}

	try {
		const user = await User.aggregate([
			{
				$match: { username: req.body.username },
			},
			{
				$lookup: {
					from: "followings",
					localField: "_id",
					foreignField: "user",
					as: "followings",
				},
			},
			{
				$lookup: {
					from: "followers",
					localField: "_id",
					foreignField: "user",
					as: "followers",
				},
			},
			{
				$project: {
					firstName: 1,
					lastName: 1,
					userName: 1,
					profilePicture: 1,
					bio: 1,
					followings: {
						$size: { $arrayElemAt: ["$followings.followings", 0] },
					},
					followers: {
						$size: { $arrayElemAt: ["$followers.followers", 0] },
					},
				},
			},
		]);

		if (user.length < 1) {
			res.status(404).json({ message: "Không tìm thấy người dùng" });
		}

		const postCount = await Post.find({
			author: mongoose.Types.ObjectId(user[0].id),
		}).countDocuments();

		const data = {
			...user[0],
			postCount,
		};
		req.body.user = data;
		next();
	} catch (error) {
		return res.status(500).json({
			message: err.message,
		});
	}
};

exports.getUserPost = (req, res, next) => {
	if (req.body.profilePage == "true") {
		console.log("pass");
		Post.aggregate([
			{
				$match: { author: mongoose.Types.ObjectId(req.body.user._id) },
			},
			{ $sort: { createAt: -1 } },
			{ $limit: 10 },
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
						$size: { $ifNull: ["$comments", []] },
					},
					description: 1,
					"author.id": 1,
					"author.username": 1,
				},
			},
		])
			.then((posts) => {
				req.body.posts = posts;
				next();
			})
			.catch((err) => {
				console.log(err);
				return res.status(500).json({ message: err.message });
			});
	} else {
		next();
	}
};

exports.getPosts = async (req, res) => {
	try {
		const posts = await Post.aggregate([
			{
				$match: {
					$and: [
						{
							_id: {
								$lt: mongoose.Types.ObjectId(req.body.lastId),
							},
							author: mongoose.Types.ObjectId(req.body.userId),
						},
					],
				},
			},
			{ $sort: { createAt: -1 } },
			{ $limit: 10 },
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
				$lookup: "comments",
				localField: "_id",
				foreignField: "post",
				as: "comments",
			},
			{
				$project: {
					photo: 1,
					createAt: 1,
					tags: 1,
					hashtags: 1,
					location: 1,
					likes: {
						$size: { $arrayElemAt: ["$likes.users_likes", 0] },
					},
					comment: {
						$size: "$comments",
					},
					description: 1,
					"author.id": 1,
					"author.username": 1,
					"author.profilePicture": 1,
				},
			},
		]);

		res.status(200).json({ posts });
	} catch (error) {
		res.status(500).json({ message: err.message });
	}
};

exports.searchUsersByName = (req, res) => {
	if (req.body.q) {
		User.find({
			$or: [
				{ firstName: new RegExp("^" + req.body.q, "i") },
				{ lastName: new RegExp("^" + req.body.q, "i") },
				{ username: new RegExp("^" + req.body.q, "i") },
			],
		})
			.limit(10)
			.select("username profilePicture firstName lastName")
			.then((users) => {
				return res.status(200).json({ users });
			})
			.catch((err) => res.status(500).json({ message: err.message }));
	}
};

exports.getFollowings = async (req, res, next) => {
	try {
		const users = User.aggregate([
			{ $match: { _id: mongoose.Types.ObjectId(req.userData.userId) } },
			{
				$lookup: {
					from: "followings",
					localField: "_id",
					foreignField: "user",
					as: "followings",
				},
			},
			{
				$project: {
					followings: { $arrayElemAt: ["$followings.followings.user", 0] },
				},
			},
		]);

		req.body.followings = users[0].followings;
		next();
	} catch (error) {
		res.status(500).json({ message: err.message });
	}
};

exports.getUserProfileFollowers = async (req, res) => {
	try {
		const users = await Follower.find({
			user: mongoose.Types.ObjectId(req.body.userId),
		})
			.populate("followers.user", "username profilePicture")
			.select("followers.user");

		return res.status(200).json({ users });
	} catch (error) {
		res.status(500).json({ message: err.message });
	}
};

exports.getUserProfileFollowings = async (req, res) => {
	try {
		const users = await Following.find({
			user: mongoose.Types.ObjectId(req.body.userId),
		})
			.populate("followings.user", "username profilePicture")
			.select("followings.user");

		return res.status(200).json({ users });
	} catch (error) {
		res.status(500).json({ message: err.message });
	}
};

exports.changeStatus = async (req, res, io) => {
	try {
		if (!clients.length) {
			const follower = await Follower.find({
				user: mongoose.Types.ObjectId(userId),
			}).select("followers.user");

			follower[0].followers.forEach((user) => {
				const toUserId = user.user;
				io.sockets.in(toUserId).emit("activityStatusUpdate", {
					activityStatus: "offline",
					user: userId,
				});
			});

			const following = await Following.find({
				user: mongoose.Types.ObjectId(userId),
			}).select("followings.user");

			following[0].followings.forEach((user) => {
				const toUserId = user.user;
				io.sockets.in(toUserId).emit("activityStatusChange", {
					activityStatus: "offline",
					user: userId,
				});
			});

			await User.findByIdAndUpdate(
				{ _id: userId },
				{ activityStatus: "offline" },
				{ new: true }
			);
		} else {
			const follower = await Follower.find({
				user: mongoose.Types.ObjectId(userId),
			}).select("followers.user");

			follower[0].followers.forEach((users) => {
				const toUserId = users.user;
				io.sockets.in(toUserId).emit("activityStatusUpdate", {
					activityStatus: "online",
					user: userId,
				});
			});

			const following = await Following.find({
				user: mongoose.Types.ObjectId(userId),
			}).select("followings.user");

			following[0].followings.forEach((user) => {
				const toUserId = user.user;
				io.sockets.in(toUserId).emit("activityStatusChange", {
					activityStatus: "online",
					user: userId,
				});
			});

			await User.findByIdAndUpdate(
				{ _id: userId },
				{ activityStatus: "online" },
				{ new: true }
			);
		}
	} catch (error) {
		console.log(err.message);
	}
};
