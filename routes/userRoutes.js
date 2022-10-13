const router = require("express").Router();
const userController = require("./../controllers/userController");

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

router.route("/login").post(userController.loginUser);

router.route("/forgot-password").post(userController.forgotPassword);

router.route("/verify-otp-code/:id").patch(userController.verifyOTPCode);

router.route("/update-password/:id").patch(userController.updatePassword);

router
  .route("/update-account-status/:id")
  .patch(userController.updateAccountStatus);

router.route("/verify/:id/:token").patch(userController.verifyUser);

module.exports = router;
