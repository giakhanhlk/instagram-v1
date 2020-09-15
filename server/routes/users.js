const express = require("express");
const userController = require("../controllers/userController");
const checkAuth = require("../middlewares/checkAuth");
const checkEmailEnv = require("../middlewares/checkEmailEnv");
const checkUser = require("../middlewares/checkUser");
const userValidator = require("../middlewares/schemaValidators/userValidator");
const verificationCheck = require("../middlewares/verificationCheck");
const router = express.Router();

/* GET users listing. */

router.post("/signup", userValidator.addUser, userController.addUser);

router.post(
	"/login",
	userValidator.loginUser,
	verificationCheck,
	userController.loginUser,
	userController.sendUserData
);

router.post(
	"/password/reset",
	checkAuth,
	userValidator.resetPassword,
	userController.resetPassword
);

router.post(
	"/password/forgot",
	checkEmailEnv,
	userValidator.sendVerificationEmail,
	userController.sendForgotPasswordEmail
);

router.post(
	"/verification",
	checkEmailEnv,
	userValidator.sendVerificationEmail,
	userController.sendVerificationEmail
);

router.post(
	"/update",
	checkAuth,
	userValidator.updateUser,
	userController.updateUser
);

router.post(
	"/data",
	checkAuth,
	userValidator.getUserData,
	userController.getUserData,
	userController.sendUserData
);

router.post(
	"/follow",
	checkAuth,
	userValidator.followUser,
	checkUser,
	userController.followUser
);

router.post(
	"/profile",
	checkAuth,
	userValidator.getUserProfileData,
	userController.getUserProfileData,
	userController.getUserPost,
	userController.sendUserData
);

router.post(
	"/search",
	checkAuth,
	userValidator.searchByUsername,
	userController.searchUsersByName
);

router.post(
	"/followers",
	checkAuth,
	userValidator.getUserProfileFollowers,
	userController.getUserProfileFollowers
);

router.post(
	"/followings",
	checkAuth,
	userValidator.getUserProfileFollowings,
	userController.getUserProfileFollowings
);

router.post(
	"/post",
	checkAuth,
	userValidator.getPosts,
	userController.getPosts
);

router.post(
	"/avatar",
	checkAuth,
	userController.upload,
	userController.changeProfilePicture
);

router.get("/email/activate/:token", userController.active);

router.post("/new", userValidator.getNewUsers, userController.getNewUsers);

router.post("/delete", checkAuth, userController.deleteUser);

module.exports = router;
