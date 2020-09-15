const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentReplyLikeSchema = new Schema({
	comment: { type: Schema.Types.ObjectId, ref: "Comment", required: true },
	users_likes: [
		{
			type: Schema.Types.ObjectId,
			required: true,
			ref: "User",
		},
	],
});

module.exports = mongoose.model("CommentReplyLike", commentReplyLikeSchema);
