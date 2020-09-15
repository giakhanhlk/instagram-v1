const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const socket_io = require("socket.io");
const jwt = require("jsonwebtoken");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const postsRouter = require("./routes/posts");

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
