const express = require("express");
const commentController = require("../controllers/commentController");
const checkAuth = require("../middlewares/checkAuth");
const commentValidator = require("../middlewares/schemaValidators/commentValidator");
const router = express.Router();

/* GET users listing. */
router.post(
	"/create",
	checkAuth,
	commentValidator.addComment,
	commentController.addComment
);

router.post(
	"/all",
	checkAuth,
	commentValidator.getComments,
	commentController.getCommentsForPost
);

router.post(
	"/like",
	checkAuth,
	commentValidator.likeComment,
	commentController.likeComment
);

router.post(
	"/reply",
	checkAuth,
	commentValidator.addCommentReply,
	commentController.addCommentReply
);

router.post(
	"/reply/like",
	checkAuth,
	commentValidator.likeCommentReply,
	commentController.likeCommentReply
);

router.post(
	"/like/get",
	checkAuth,
	commentValidator.getCommentLikes,
	commentController.getCommentLikes
);

router.post(
	"/reply/like/get",
	checkAuth,
	commentValidator.getCommentReplyLikes,
	commentController.getCommentReplyLikes
);

router.post(
	"/comment/get",
	checkAuth,
	commentValidator.getCommentReplies,
	commentController.getRepliesForComment
);

module.exports = router;
