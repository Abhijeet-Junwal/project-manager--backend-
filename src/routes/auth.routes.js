import { Router } from "express";
import { registerUser, loggedinUser, logoutUser } from "../controllers/auth.controllers.js";
import { userRegistorValidator, userLoginValidator } from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(userRegistorValidator(), validate, registerUser);

router.route("/login").post(userLoginValidator(), validate, loggedinUser);

router.route("/logout").post(verifyJWT, logoutUser);
 

export default router;