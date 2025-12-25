export const UserRoleEum = {
    ADMIN: "admin",
    PROJECT_ADMIN: "project_admin",
    MEMBER: "member"
};

//its an array of the values of that object
export const AvalaibleUserRoles = Object.values(UserRoleEum) ;

export const TaskStatusEnum = {
    TODO: "todo",
    IN_PROGRESS: "in_progress",
    DONE: "done"
};

export const AvalaibleTaskStatus = Object.values(TaskStatusEnum);
