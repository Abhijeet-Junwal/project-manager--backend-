import { User } from "../models/user.models.js" 
import { Project } from "../models/project.models.js"; 
import { ProjectMember } from "../models/projectMember.models.js"; 
import { ApiResponse } from "../utils/api-response.js"
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";
import { UserRoleEum } from "../utils/constants.js";


const createProject = asyncHandler(async (req, res) => {
    const {name, description} = req.body;

    const project = await Project.create({
        name,
        description,
        createdBy: new mongoose.Types.ObjectId(req.user._id)
    });

    await ProjectMember.create({
        project: new mongoose.Types.ObjectId(project._id),
        user: new mongoose.Types.ObjectId(req.user._id),
        role: UserRoleEum.ADMIN
    });

    return res
        .status(201)
        .json(new ApiResponse(201, project, "Project created successfully"));
});


const updateProject = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    const {projectId} = req.params

    const project = await Project.findByIdAndUpdate(
        projectId,
        {
            name,
            description,
        },
        {new: true}
    );

    if(!project){
        throw new ApiError(400, "Project not found")
    };

    return res
        .status(201)
        .json(new ApiResponse(201, project, "Project Updated Successfully"));
});


const deleteProject = asyncHandler(async (req, res) => {
    const {projectId} = req.params

    const project = await Project.findByIdAndUpdate(projectId);

    if(!project){
        throw new ApiError(404, "Project not found")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, project, "Project Deleted Successfully"));
});


export {createProject, updateProject, deleteProject};