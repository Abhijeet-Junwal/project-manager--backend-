import { body } from "express-validator";

const userRegistorValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Enter valid Email for Registration"),
        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is Required")
            .toLowerCase()
            .withMessage("username must be in lower case")
            .isLength({min: 3})
            .withMessage("username must be at least 3 characters long"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required"),
        body("fullName")
            .optional()
            .trim()
    ]
}

const userLoginValidator = () => {
    return [
        body("email")
            .optional()
            .isEmail()
            .withMessage("Enter valid Email"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is Required")
    ]
}

export {
    userRegistorValidator,
    userLoginValidator,
}