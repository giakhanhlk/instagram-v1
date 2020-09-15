const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
	description: { type: String, default: "", trim: true },
	photo: { type: String, required: "Xin hãy chọn 1 bức ảnh" },
	createAt: { type: Date, default: Date.now },
	author: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: "Bạn nên cung cấp người đăng",
	},
	hashTags: { type: Array, default: [] },
	location: {
		type: String,
		coordinates: { type: [], default: undefined },
		address: { type: String },
	},
	tags: { type: Array, default: [] },
});

postSchema.index({ location: "2dsphere" });

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
