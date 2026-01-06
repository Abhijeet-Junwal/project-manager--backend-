import { Router } from "express";
import { registerUser } from "../controllers/auth.controllers.js";
import { userRegistorValidator } from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";

const router = Router();

router.route("/register").post(userRegistorValidator(), validate, registerUser);

export default router;