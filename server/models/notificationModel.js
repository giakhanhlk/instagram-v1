const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
	sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
	receiver: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
	read: { type: Boolean, default: false },
	createAt: { type: Date, default: Date.now },
	post: { type: Schema.Types.ObjectId, ref: "Post" },
	type: String,
	comment: { type: Schema.Types.ObjectId, ref: "Comment" },
	reply: { type: Schema.Types.ObjectId, ref: "Reply" },
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
