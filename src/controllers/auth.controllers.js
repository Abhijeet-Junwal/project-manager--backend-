import { User } from "../models/user.models.js" 
import { ApiResponse } from "../utils/api-response.js"
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { emailVerificationMailgenContent, sendEmail } from "../utils/mail.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";  


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
        isEmailVerified: false,
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
                `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`
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

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.user,
                "Current User Fetched Successfully"
            )
        )
})

const verifyEmail = asyncHandler(async (req, res) => {
    const {verificationToken} = req.params;

    if(!verificationToken){
        throw new ApiError(401, "Email verification Token is missing...")
    }
    
    let hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");
    
    const user =await User.findOne({
        emailVerificationToken: hashedToken, 
        emailVerificationExpiry: {$gt: Date.now()}
    });
    
    if(!user){
        throw new ApiError(401, "Email verification Token is invalid or expired");
    }

    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;

    user.isEmailVerified = true;
    await user.save({validateBeforeSave: false});

    return res  
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                  isEmailVerified: true,  
                },
                "Email is Verified"
            )
        );
})

const resendEmailVerification = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id);

    if(!user){
        throw new ApiError(401, "User does not exist");
    }

    if(user.isEmailVerified){
        throw new ApiError(401, "Email is already Verified");
    }

    const {unHashedToken, hashedToken, tokenExpiry} = user.generateTemporaryToken();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save({validateBeforeSave: false});

    await sendEmail({
        email: user?.email,
        subject: "Please verify your Email",
        mailgenContent: emailVerificationMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`,
        ),
    });

    return res
        .status(200)
        .json(
            200,
            {},
            "Email has been sent successfully",
        )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized Access");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findOne({_id: decodedToken._id});
        if(!user){
            throw new ApiError(401, "No user found with this refresh token");
        }
        
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "refresh token is expired");
        }
        
        const options = {
            httpOnly: true,
            secure: true,
        }
        
        const {accessToken, refreshToken: newRefreshToken} = await generateAccessAndRefreshTokens(user._id);
        
        user.refreshToken = newRefreshToken;
        await user.save({validateBeforeSave: false});
        
        return res 
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
                new ApiResponse(
                    200,
                    {accessToken,refreshToken: newRefreshToken},
                    "Access Token is Refreshed"
                )
            );
            
    } 
    catch (error) {
        console.log(error);
        throw new ApiError(401, "refresh token is expired");
    }
    
});

export {
    registerUser, 
    loggedinUser, 
    logoutUser, 
    getCurrentUser, 
    verifyEmail, 
    resendEmailVerification,
    refreshAccessToken,
};