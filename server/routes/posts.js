const express = require("express");

const checkAuth = require("../middlewares/checkAuth");

const postController = require("../controllers/postController");
const userController = require("../controllers/userController");

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

router.post(
	"/all",
	checkAuth,
	postValidator.getPosts,
	userController.getFollowings,
	postController.getPosts
);

router.post(
	"/hashtag",
	checkAuth,
	postValidator.getPostsByHashtag,
	postController.getPostByHashtag
);

router.post(
	"/location",
	checkAuth,
	postValidator.getPostsByLocation,
	postController.getPostsByLocation
);

router.post(
	"/likes",
	checkAuth,
	postValidator.getPostLikes,
	postController.getPostLike
);

router.post("/get", checkAuth, postValidator.getPost, postController.getPost);

module.exports = router;
