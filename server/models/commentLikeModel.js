const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentLikeSchema = new Schema({
	comment: { type: Schema.Types.ObjectId, ref: "Comment", required: true },
	users_likes: [
		{
			author: {
				type: mongoose.Schema.ObjectId,
				required: true,
				ref: "User",
			},
		},
	],
});

module.exports = mongoose.model("CommentLike", commentLikeSchema);
