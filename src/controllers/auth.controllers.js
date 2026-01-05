import { User } from "../models/user.models.js" 
import { ApiResponse } from "../utils/api-response.js"
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { emailVerificationMailgenContent, sendEmail } from "../utils/mail.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});
        return {accessToken, refreshToken};

    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating Access and Refresh Tokens"
        );
    }
}

const registerUser = asyncHandler( async (req, res) => {
    const {email, username, password, role} = req.body;

    const userExist = await User.findOne({
        $or: [{username}, {email}]
    })

    if(userExist){
        throw new ApiError(409, "User with this username or email already exists.", []);
    }

    const user = await User.create({
        email,
        username,
        password,
        isemailisEmailVerified: false,
    });

    const {unHashedToken, hashedToken, tokenExpiry} = user.generateTemporaryToken();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save({validateBeforeSave: false});

    await sendEmail(
        {
            email: user?.email,
            subject: "Please verify your email",
            mailgenContent: emailVerificationMailgenContent(
                user.username,
                `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
            )
        }
    );

    const createdUser = await User.findOne(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while Registering user")
    }

    return res
    .status(201)
    .json(new ApiResponse(201, {message: "Successfully Registered the User", email: user.email, username: user.username,}))
});

export {registerUser};