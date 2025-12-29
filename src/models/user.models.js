import mongoose, {Sch, Schema, Types} from "mongoose";

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

export default User = mongoose.model("User", userSchema);