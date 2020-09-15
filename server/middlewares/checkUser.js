const mongoose = require("mongoose");
const User = mongoose.model("User");

module.exports = (req, res, next) => {
	User.findById(req.body.userId)
		.then((user) => {
			if (!user)
				return res.status(404).json({ message: "Không tìm thấy người dùng" });
			next();
		})
		.catch((err) => {
			console.log(err.message);
			res.status(500).json({ message: err.message });
		});
};
