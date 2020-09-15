const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const keys = require("../configs/keys");

const postLikeSchema = new Schema({
	post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
});

const commentLikeSchema = new Schema({
	comment: { type: Schema.Types.ObjectId, ref: "Comment", required: true },
});

const commentReplyLikeSchema = new Schema({
	comment: { type: Schema.Types.ObjectId, ref: "Reply", required: true },
});

const userSchema = new Schema({
	firstName: {
		type: String,
		required: true,
		minLength: 1,
		maxLength: 30,
		trim: true,
		match: /^([A-Za-z0-9_](?:(?:[A-Za-z0-9_]|(?:\.(?!\.))){0,28}(?:[A-Za-z0-9_]))?)$/,
	},
	lastName: {
		type: String,
		required: true,
		minlength: 1,
		maxlength: 30,
		trim: true,
		match: /^([A-Za-z0-9_](?:(?:[A-Za-z0-9_]|(?:\.(?!\.))){0,28}(?:[A-Za-z0-9_]))?)$/,
	},
	username: {
		type: String,
		minlength: 3,
		maxlength: 30,
		trim: true,
		match: /^([A-Za-z0-9_](?:(?:[A-Za-z0-9_]|(?:\.(?!\.))){0,28}(?:[A-Za-z0-9_]))?)$/,
		required: true,
		unique: true,
	},
	bio: {
		type: String,
		default: "",
		trim: true,
		maxlength: 250,
	},
	email: {
		type: String,
		trim: true,
		required: true,
		maxlength: 40,
		unique: true,
		match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
	},
	password: {
		trim: true,
		minlength: 3,
		type: String,
		required: true,
	},
	date: {
		type: Date,
		default: Date.now,
	},
	profilePicture: {
		type: String,
		default: "person.png",
	},
	activityStatus: {
		type: String,
		default: "offline",
	},
	activated: {
		type: Boolean,
		default: keys.ENABLE_SEND_EMAIL === "true" ? false : true,
	},
	postLikes: [postLikeSchema],
	commentLikes: [commentLikeSchema],
	commentReplyLikes: [commentReplyLikeSchema],
});

userSchema.index({ username: "text", firstName: "text", lastName: "text" });

const User = mongoose.model("User", userSchema);

module.exports = User;
