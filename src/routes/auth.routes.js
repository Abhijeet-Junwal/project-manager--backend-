import { Router } from "express";
import { registerUser, loggedinUser, logoutUser, getCurrentUser, verifyEmail, resendEmailVerification, refreshAccessToken, forgotPasswordRequest, resetPassword, changeCurrentPassword } from "../controllers/auth.controllers.js";
import { userRegistorValidator, userLoginValidator, forgotPasswordValidator, resetForgotPasswordValidator, changeCurrentPasswordValidator } from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// unsecure routes
router.route("/register").post(userRegistorValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loggedinUser);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/forgot-password").post(forgotPasswordValidator(), validate, forgotPasswordRequest);
router.route("/reset-password/:resetToken").post(resetForgotPasswordValidator(), validate, resetPassword);

// secure routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/resend-email-verification").post(verifyJWT, resendEmailVerification);
router.route("/change-password").post(verifyJWT, changeCurrentPasswordValidator(), validate, changeCurrentPassword);

export default router;