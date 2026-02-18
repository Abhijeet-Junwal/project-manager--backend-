import { User } from "../models/user.models.js" 
import { Project } from "../models/project.models.js"; 
import { ProjectMember } from "../models/projectMember.models.js"; 
import { ApiResponse } from "../utils/api-response.js"
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";
import { UserRoleEum } from "../utils/constants.js";


const getProjects = asyncHandler(async (req, res) => {
    const projects = await ProjectMember.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "project",
                localField: "project",
                foreignField: "_id",
                as: "project",
                pipeline: [
                    {
                        $lookup: {
                            from: "projectMember",
                            localField: "_id",
                            foreignField: "project",
                            as: "projectmembers"
                        }
                    },
                    {
                        $addFields: {
                            members: {
                                $size: "$projectmembers"
                            }
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$project"
        },
        {
            $project: {
                project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    members: 1,
                    createdBy: 1,
                    createdAt: 1,
                },
                role: 1,
                _id: 0
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, projects, "Projects fetched successfully")); 
});


const getProjectsbyId = asyncHandler(async (req, res) => {
    const {projectId} = req.params;
    const project = await Project.findById("projectId");

    if(!project){
        throw new ApiError(404, "Invalid Project Id");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, project, "Project fetched successfully")
        );
})


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

    const project = await Project.findByIdAndDelete(projectId);

    if(!project){
        throw new ApiError(404, "Project not found")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, project, "Project Deleted Successfully"));
});


const addMembersToProject = asyncHandler(async (req, res) => {
    const {email, role} = req.body;
    const {projectId} = req.params;
    const user = await User.findOne({email});

    if(!user){
        throw new ApiError(400, "User does not exist")
    }

    const newMember = await ProjectMember.findByOneAndUpdate(
        {
            user: new mongoose.Types.ObjectId(user._id),
            project: new mongoose.Types.ObjectId(projectId),
        },
        {
            user: new mongoose.Types.ObjectId(user._id),
            project: new mongoose.Types.ObjectId(projectId),
            role: role
        },
        {
            new: true,
            upsert: true
        }
    );

    return res 
        .status(201)
        .json(new ApiResponse(201, newMember, "Project member added successfully"))
});

const getProjectMembers = asyncHandler(async (req, res) => {
    const {projectId} = req.params
    const project = await Project.findById(projectId);

    if(!project){
        throw new ApiError(404, "Project does not found")
    }

    const projectMembers = await ProjectMember.aggregate([
        {
            $match: {
                project: new mongoose.Types.ObjectId(projectId)
            }
        },
        {
            $lookup: {
                from: "User",
                localField: "user",
                foreignField: "_id ",
                as: "user",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            avatar: 1,
                            fullname: 1,
                        }
                    }
                ]

            },
        },
        {
            $addFields: {
                user: {
                    $arrayElemAt: ["$user", 0]
                }
            }
        },
        {
            $project: {
                project: 1,
                user: 1,
                role: 1,
                _id: 0,
                createdAt: 1,
                updatedAt: 1,
            }
        }


    ]);

    return res 
        .status(201)
        .json(new ApiResponse(201, projectMembers, "Project members fetched successfully"));
});


export {
    getProjects,
    getProjectsbyId,
    createProject, 
    updateProject, 
    deleteProject,
    addMembersToProject,
    getProjectMembers,
};