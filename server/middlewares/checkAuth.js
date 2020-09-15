const jwt = require("jsonwebtoken");

const keys = require("../configs/keys");

module.exports = (req, res, next) => {
	try {
		const token = req.get("Authorization").split(" ")[1];
		const decoded = jwt.verify(token, keys.SECRET_KEY);
		req.userData = decoded;
		next();
	} catch (error) {
		return res.status(401).json({ message: "Token không hợp lệ" });
	}
};
