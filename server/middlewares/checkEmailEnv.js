const keys = require("../configs/keys");

module.exports = (req, res, next) => {
	if (keys.ENABLE_SEND_EMAIL === "false") {
		return res
			.status(200)
			.json({ message: "Xác thực tài khoản qua email đã bị vô hiệu hóa" });
	}
	next();
};
