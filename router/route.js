const express = require("express");
const router = express.Router();
const controller = require("../controllers/appController.js");
const middleware = require('../middleware/auth.js')
const registerMail = require('../controllers/mailer.js')


router.route("/register").post(controller.register)
router.route("/registerMail").post(registerMail)
// router.route("/authenticate").get((req, res) => res.json("register route"));
router.route("/login").post(controller.verifyUser,controller.login);

router.route("/user/:username").get(controller.getUser);
router.route('/generateOTP').get(middleware.localVariable, controller.verifyUser,controller.generateOTP)
router.route("/verifyOTP").get(controller.verifyOTP);
// router.route("/createResetSession").get(controller.createResetSession);

router.route("/updateuser").put(middleware.Auth,controller.updateUser);
router.route("/resetPassword").put(controller.verifyUser,controller.resetPassword);

module.exports = router;
