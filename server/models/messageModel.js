const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
	roomId: { type: Schema.Types.ObjectId },
	sender: { type: Schema.Types.ObjectId, ref: "User" },
	text: {
		type: String,
		trim: true,
		minlength: 1,
	},
	messageType: {
		type: String,
		required: true,
	},
	receiver: { type: Schema.Types.ObjectId, ref: "User" },
	photo: String,
	read: { type: Boolean, default: false },
	createAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", messageSchema);
