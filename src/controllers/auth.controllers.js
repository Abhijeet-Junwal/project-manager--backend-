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

const loggedinUser = asyncHandler(async (req, res) => {
    const {email, username, password} = req.body;

    if(!email){
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({email});

    if(!user){
        throw new ApiError(400, "User is not Registered");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(409, "Invalid Credentials");
    }

    const {accessToken, refreshToken} =await generateAccessAndRefreshTokens(user._id);

    const options = {
        httpOnly: true,
        secure: true
    }

    const createdUser = await User.findOne(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: user,
                accessToken,
                refreshToken
            },
            "User logged in Successffully"
        )
    )

});

const logoutUser = asyncHandler(async (req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {refreshToken: ""}
        },
        {
            new: true
        },
    ); 

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User Logged Out Successfully"));
});

export {registerUser, loggedinUser, logoutUser};