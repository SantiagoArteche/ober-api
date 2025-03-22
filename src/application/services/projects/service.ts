import { ObjectId } from "mongodb";
import { CustomError } from "../../../domain/errors/custom-errors";
import { projectModel } from "../../../infraestructure/data/mongo-db/models/project.model";
import { userModel } from "../../../infraestructure/data/mongo-db/models/user.model";
import { Project } from "./interfaces";
import { Pagination } from "../shared/interfaces";
import { taskModel } from "../../../infraestructure/data/mongo-db/models/task.model";
import mongoose from "mongoose";
import { Logger } from "../../../infraestructure/config/logger";

export class ProjectService {
  constructor(private readonly logger: Logger = new Logger()) {}

  public getAllProjects = async ({ skip, limit }: Pagination) => {
    try {
      const allProjects = await projectModel
        .find()
        .limit(limit)
        .skip(skip!)
        .populate([
          { path: "tasks", select: "_id name status" },
          { path: "users", select: "name" },
        ]);

      const totalDocuments = await projectModel.countDocuments();

      const currentPage = Math.ceil(skip! / limit + 1);
      const totalPages = Math.ceil(totalDocuments / limit);

      this.logger.info("Successfully fetched all projects.");

      return {
        msg: "OK",
        projects: allProjects,
        totalDocuments,
        totalPages,
        limit,
        skip,
        page: currentPage,
        prev:
          currentPage > 1
            ? `http://localhost:8000/api/projects?limit=${limit}&skip=${
                (currentPage - 2) * limit
              }`
            : null,
        next:
          currentPage < totalPages
            ? `http://localhost:8000/api/projects?limit=${limit}&skip=${
                currentPage * limit
              }`
            : null,
      };
    } catch (error) {
      this.logger.error(`Error fetching all projects: ${error}`);
      throw error;
    }
  };

  public getProjectById = async (id: string) => {
    try {
      const findProject = await projectModel.findById(id).populate([
        { path: "tasks", select: "_id name status" },
        { path: "users", select: "name" },
      ]);

      if (!findProject) {
        this.logger.warning(`Project with id: ${id} not found.`);
        throw CustomError.notFound(`Project with id ${id} not found`);
      }

      this.logger.info(`Successfully fetched project with id: ${id}`);

      return { msg: "OK", project: findProject };
    } catch (error) {
      this.logger.error(`Error fetching project with id: ${id}, ${error}`);
      throw error;
    }
  };

  public createProject = async (projectData: Project) => {
    try {
      const { tasks, ...rest } = projectData;
      const newProject = await projectModel.create(rest);

      this.logger.info(
        `Project created successfully with id: ${newProject._id}`
      );

      return { msg: "Project created", newProject };
    } catch (error) {
      this.logger.error(`Error creating project: ${error}`);
      throw error;
    }
  };

  public updateProject = async (id: string, { name, users }: Project) => {
    try {
      await this.getProjectById(id);

      const updateProject = await projectModel.findByIdAndUpdate(
        id,
        {
          name: name && name,
          users: users && users,
        },
        { new: true }
      );

      this.logger.info(`Project with id: ${id} updated successfully.`);

      return { msg: "Project updated", updatedProject: updateProject };
    } catch (error) {
      this.logger.error(`Error updating project with id: ${id}, ${error}`);
      throw error;
    }
  };

  public deleteProjectById = async (id: string) => {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const findProject = await this.getProjectById(id);

      if (!findProject) {
        this.logger.warning(`Project with id: ${id} not found for deletion.`);
        throw CustomError.notFound(`Project with id ${id} not found`);
      }

      if (findProject.project.tasks?.length) {
        for (const task of findProject.project.tasks) {
          await taskModel.findByIdAndDelete(task._id, { session });
        }
      }

      await projectModel.findByIdAndDelete(id, { session });

      await session.commitTransaction();

      this.logger.info(`Project with id: ${id} deleted successfully.`);

      return { msg: `Project with id ${id} was deleted` };
    } catch (error) {
      await session.abortTransaction();
      this.logger.error(`Error deleting project with id: ${id}, ${error}`);
      throw error;
    } finally {
      session.endSession();
    }
  };

  public assignUserToProject = async (projectId: string, userId: string) => {
    try {
      const [project, user] = await Promise.all([
        projectModel.findById(projectId),
        userModel.findById(userId),
      ]);

      if (!project) {
        this.logger.warning(`Project with id: ${projectId} not found.`);
        throw CustomError.notFound(`Project with id ${projectId} not found`);
      }

      if (!user) {
        this.logger.warning(`User with id: ${userId} not found.`);
        throw CustomError.notFound(`User with id ${userId} not found`);
      }

      if (project.users.includes(userId as unknown as ObjectId)) {
        this.logger.warning(
          `User with id: ${userId} is already assigned to project with id: ${projectId}`
        );
        throw CustomError.conflict(
          `The user with id ${userId} is already working in the project`
        );
      }

      const updateProject = await projectModel.findByIdAndUpdate(
        projectId,
        {
          users: [...project.users, userId],
        },
        { new: true }
      );

      this.logger.info(
        `User with id: ${userId} successfully assigned to project with id: ${projectId}`
      );

      return {
        msg: `User with id: ${userId} successfully assigned to project with id: ${projectId}`,
        projectUpdated: updateProject,
      };
    } catch (error) {
      this.logger.error(
        `Error assigning user with id: ${userId} to project with id: ${projectId}, ${error}`
      );
      throw error;
    }
  };
}
