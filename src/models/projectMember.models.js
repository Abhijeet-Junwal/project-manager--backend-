import mongoose, { Schema } from "mongoose";
import { AvalaibleUserRoles, UserRoleEum } from "../utils/constants.js";

const projectMemberSchema = new Schema(
    {
        project: {
            type: Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        role: {
            type: String,
            enum: AvalaibleUserRoles,
            default: UserRoleEum.MEMBER,
        },
    },
    {timestamps: true}
);

export const ProjectMember = mongoose.model("ProjectMember", projectMemberSchema);