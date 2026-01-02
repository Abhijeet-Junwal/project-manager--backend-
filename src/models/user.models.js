import bcrypt from "bcrypt";
import mongoose, {Sch, Schema, Types} from "mongoose";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
    {
        avatar: {
            type: {
                url: String,
                localPath: String
            },
            default: {
                url: "https://placehold.co/200x200",
                localPath: ""
            }
        },
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            trim: true
        },
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        refreshToken: {
            type: String
        },
        forgotPasswordToken: {
            type: String
        },
        forgotPasswordExpiry: {
            type: Date
        },
        emailVerificationToken: {
            type: String
        },
        emailVerificationExpiry: {
            type: Date
        }
    }, {
        timestamps: true,
    },
);

// Hooks
userSchema.pre("save", async function (next) {

    if(!this.isModified("password")) return next();   //if the password is not entered first time or changed no need to do hashing(encrypting)

    this.password = await bcrypt.hash(this.password, 10);
    next();
})

// Methods
userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:  process.env.ACCESS_TOKEN_EXPIRY}
    )
}


userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn:  process.env.REFRESH_TOKEN_EXPIRY}
    )
}

export default User = mongoose.model("User", userSchema);