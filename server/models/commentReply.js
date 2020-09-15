const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentReplySchema = new Schema({
	text: { type: String, required: true },
	author: { type: Schema.Types.ObjectId, ref: "User", required: true },
	commentAt: { type: Schema.Types.ObjectId, ref: "Comment", required: true },
	createAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CommentReply", commentReplySchema);
