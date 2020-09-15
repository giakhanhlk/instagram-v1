const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatRoomSchema = new Schema({
	members: [{ type: Schema.Types.ObjectId, ref: "User" }],
	roomName: { type: String, default: "" },
	lastActive: { type: Date, default: Date.now },
	createAt: { type: Date, default: Date.now },
	messages: { type: Number, default: 0 },
});

chatRoomSchema.statics.getRooms = (userId) => {
	return this.aggregate([
		// Lookup Stores and populate their reviews
		{ $match: { members: { $in: [userId] } } },
		{
			$lookup: {
				from: "users",
				localField: "members",
				foreignField: "_id",
				as: "members",
			},
		},
		{
			$lookup: {
				from: "messages",
				as: "lastMessage",
				let: { indicator_id: "$_id" },
				pipeline: [
					{
						$match: {
							$expr: { $eq: ["$roomId", "$$indicator_id"] },
						},
					},
					{ $sort: { createAt: -1 } }, // add sort if needed (for example, if you want first 100 comments by creation date)
					{ $limit: 1 },
				],
			},
		},
		{
			$project: {
				"members._id": 1,
				"members.firstName": 1,
				"members.lastName": 1,
				"members.username": 1,
				"members.profilePicture": 1,
				"members.activityStatus": 1,
				message: 1,
				roomName: 1,
				createAt: 1,
				lastMessage: 1,
				//averageRating: { $avg: { $size: "$messages" } }
			},
		},
		// sort it by our new field, highest reviews first
		{ $sort: { "lastMessage.createAt": -1 } },
		// limit to at most 10
	]);
};

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);

module.exports = ChatRoom;
