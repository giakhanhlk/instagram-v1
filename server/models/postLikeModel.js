const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postLikeSchema = new Schema({
	post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
	users_likes: [
		{
			author: {
				type: Schema.Types.ObjectId,
				required: true,
				ref: "User",
			},
		},
	],
});

const PostLike = mongoose.model("PostLike", postLikeSchema);

module.exports = PostLike;
