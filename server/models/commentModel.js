const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
	text: { type: String, required: true },
	author: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: "User",
	},
	post: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: "Post",
	},
	createAt: {
		type: Date,
		default: Date.now,
	},
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
