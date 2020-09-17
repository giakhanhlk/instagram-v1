const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const socket_io = require("socket.io");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const postsRouter = require("./routes/posts");
const notificationRouter = require("./routes/notification");
const commentsRouter = require("./routes/comments");

const userController = require("./controllers/userController");

const keys = require("./configs/keys");

mongoose
	.connect(keys.MONGODB_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
		useFindAndModify: false,
	})
	.then(() => console.log("MongoDB connected"))
	.catch((err) => console.log(err));

const app = express();
const io = socket_io();

app.io = io;
app.set("socketio", io);

io.use((socket, next) => {
	if (socket.handshake.query && socket.handshake.query.token) {
		const token = socket.handshake.query.token.split(" ")[1];
		jwt.verify(token, keys.SECRET_KEY, (err, decoded) => {
			if (err) return next(new Error("Authentication error"));
			socket.userData = decoded;
			next();
		});
	} else {
		next(new Error("Authentication error"));
	}
}).on("connection", (socket) => {
	// Connection now authenticated to receive further events
	socket.join(socket.userData.userId);
	io.in(socket.userData.userId).clients((err, clients) => {
		userController.changeStatus(socket.userData.userId, clients, io);
		console.log(clients);
	});
	socket.on("typing", (data) => {
		socket.to(data.userId).emit("typing", { roomId: data.roomId });
	});
	socket.on("stoppedTyping", (data) => {
		socket.to(data.userId).emit("stoppedTyping", { roomId: data.roomId });
	});
	socket.on("disconnect", () => {
		socket.leave(socket.userData.userId);
		io.in(socket.userData.userId).clients((err, clients) => {
			userController.changeStatus(socket.userData.userId, clients, io);
		});
	});
});

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 200, // limit each IP to 200 requests per windowMs
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/api/user", usersRouter);
app.use("/api/post", postsRouter);
app.use("/api/comment", commentsRouter);
app.use("/api/notification", notificationRouter);

app.get("/auth/reset/password/:jwt", function (req, res) {
	return res.status(404).json({ message: "go to port 3000" });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render("error");
});

module.exports = app;
