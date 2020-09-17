const express = require("express");
const router = express.Router();

const chatController = require("../controllers/chatController");

const checkAuth = require("../middleware/checkAuth");
const chatValidator = require("../middleware/schemaValidators/chatValidator");
const checkRoom = require("../middleware/checkRoom");

router.post("/room/", checkAuth, chatController.getChatRooms);

router.post(
	"/get",
	checkAuth,
	chatValidator.getMessagesForRoom,
	chatController.getMessagesForRoom
);

router.post(
	"/send/image",
	checkAuth,
	chatController.upload,
	chatValidator.sendImage,
	checkRoom,
	chatController.createImageMessage
);

router.post(
	"/call",
	checkAuth,
	chatValidator.handleCall,
	checkRoom,
	chatController.handleCall
);

router.post(
	"/answer",
	checkAuth,
	chatValidator.answer,
	checkRoom,
	chatController.answer
);

router.post(
	"/send",
	checkAuth,
	chatValidator.sendMessage,
	checkRoom,
	chatController.sendMessage
);

router.post(
	"/read",
	checkAuth,
	chatValidator.readMessages,
	checkRoom,
	chatController.readMessages
);

module.exports = router;
