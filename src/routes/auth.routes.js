import { Router } from "express";
import { registerUser, loggedinUser } from "../controllers/auth.controllers.js";
import { userRegistorValidator, userLoginValidator } from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";

const router = Router();

router.route("/register").post(userRegistorValidator(), validate, registerUser);

router.route("/login").post(userLoginValidator(), validate, loggedinUser);
 

export default router;