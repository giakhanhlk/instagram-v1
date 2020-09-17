const express = require("express");
const router = express.Router();

const notificationController = require("../controllers/notificationController");

const checkAuth = require("../middlewares/checkAuth");
const notificationValidator = require("../middlewares/schemaValidators/notificationValidator");

router.post(
	"/read",
	checkAuth,
	notificationValidator.readNotifications,
	notificationController.readNotifications
);

router.post(
	"/get",
	checkAuth,
	notificationValidator.getNotifications,
	notificationController.getNotifications
);

module.exports = router;
