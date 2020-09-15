const express = require("express");

const checkAuth = require("../middlewares/checkAuth");

const postController = require("../controllers/postController");

const postValidator = require("../middlewares/schemaValidators/postValidator");

const router = express.Router();

router.post(
	"/create",
	checkAuth,
	postController.upload,
	postValidator.createPost,
	postController.createPost
);

router.post(
	"/like",
	checkAuth,
	postValidator.likePost,
	postController.likePost
);

router.post(
	"/delete",
	checkAuth,
	postValidator.deletePost,
	postController.deletePost
);

module.exports = router;
