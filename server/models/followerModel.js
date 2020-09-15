const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const followerSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: "User",
	},
	followers: [
		{
			user: {
				type: Schema.Types.ObjectId,
				required: true,
				ref: "User",
			},
		},
	],
});

const Follower = mongoose.model("Follower", followerSchema);

module.exports = Follower;
