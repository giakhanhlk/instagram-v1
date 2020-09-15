const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");

const keys = require("../configs/keys");

exports.sendVerificationEmail = (data) => {
	const { email, _id, username } = data;
	const token = jwt.sign(
		{
			email,
			_id,
		},
		keys.SECRET_KEY,
		{
			expiresIn: "30m",
		}
	);

	// config cho mailserver và mail, nhập dữ liệu vào
	const config = {
		mailserver: {
			service: "gmail",
			auth: {
				user: keys.EMAIL_USER,
				pass: keys.EMAIL_PASS,
			},
		},
		mail: {
			from: keys.EMAIL_USER,
			to: email,
			subject: "Xác thực tài khoản",
			template: "emailVerify",
			context: {
				token,
				username,
				host: keys.HOST,
			},
		},
	};

	const sendEmail = async ({ mailserver, mail }) => {
		// // create a nodemailer transporter using smtp
		let transporter = nodemailer.createTransport(mailserver);

		transporter.use(
			"compile",
			hbs({
				viewEngine: {
					partialDir: "./server/emailViews",
					defaultLayout: "",
				},
				viewPath: "./server/emailViews",
				extName: ".hbs",
			})
		);

		await transporter.sendMail(mail);
	};

	sendEmail(config).catch((err) => console.log(err));
};

exports.sendPasswordResetEmail = (data) => {
	const { email, _id, username } = data;
	console.log("Sending email");
	const token = jwt.sign(
		{
			email,
			_id,
		},
		keys.SECRET_KEY,
		{
			expiresIn: "10m",
		}
	);

	const config = {
		mailserver: {
			service: "gmail",
			auth: {
				user: keys.EMAIL_USER,
				pass: keys.EMAIL_PASS,
			},
		},
		mail: {
			form: keys.EMAIL_USER,
			to: email,
			subject: "Lấy lại mật khẩu",
			template: "passwordReset",
			context: {
				token,
				username,
				host: keys.HOST,
			},
		},
	};

	const sendEmail = async ({ mailserver, mail }) => {
		// create a nodemailer transporter using smtp
		let transporter = nodemailer.createTransport(mailserver);

		transporter.use(
			"compile",
			hbs({
				viewEngine: {
					partialDir: "./server/emailViews",
					defaultLayout: "",
				},
				viewPath: "./server/emailViews",
				extName: ".hbs",
			})
		);

		// send mail using transporter
		await transporter.sendMail(mail);
	};

	sendEmail(config).catch((err) => console.log(err));
};
