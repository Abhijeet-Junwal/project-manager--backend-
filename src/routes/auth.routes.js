import { Router } from "express";
import { registerUser, loggedinUser, logoutUser, getCurrentUser, verifyEmail } from "../controllers/auth.controllers.js";
import { userRegistorValidator, userLoginValidator } from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// unsecure routes
router.route("/register").post(userRegistorValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loggedinUser);
router.route("/verify-email/:verificationToken").get(verifyEmail);

// secure routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);
 

export default router;