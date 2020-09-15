const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const followingSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: "User",
	},
	followings: [
		{
			user: {
				type: Schema.Types.ObjectId,
				required: true,
				ref: "User",
			},
		},
	],
});

const Following = mongoose.model("Following", followingSchema);

module.exports = Following;
