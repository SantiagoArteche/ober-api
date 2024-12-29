import { ObjectId } from "mongodb";
import { CustomError } from "../../../domain/errors/custom-errors";
import { projectModel } from "../../../infraestructure/data/mongo-db/models/project.model";
import { userModel } from "../../../infraestructure/data/mongo-db/models/user.model";
import { Project } from "./interfaces";
import { Pagination } from "../shared/interfaces";

export class ProjectService {
  public getAllProjects = async ({ skip, limit }: Pagination) => {
    try {
      const allProjects = await projectModel.find().limit(limit).skip(skip!);
      const totalDocuments = await projectModel.countDocuments();

      const currentPage = Math.ceil(skip! / limit + 1);
      const totalPages = Math.ceil(totalDocuments / limit);
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
      throw error;
    }
  };

  public getProjectById = async (id: string) => {
    try {
      const findProject = await projectModel.findById(id);

      if (!findProject) {
        throw CustomError.notFound(`Project with id ${id} not found`);
      }

      return { msg: "OK", project: findProject };
    } catch (error) {
      throw error;
    }
  };

  public createProject = async (projectData: Project) => {
    try {
      const newProject = await projectModel.create(projectData);

      return { msg: "Project created", newProject };
    } catch (error) {
      throw error;
    }
  };

  public updateProject = async (
    id: string,
    { name, tasks, users }: Project
  ) => {
    try {
      await this.getProjectById(id);

      const updateProject = await projectModel.findByIdAndUpdate(
        id,
        {
          name: name && name,
          tasks: tasks && tasks, //Array.from(new Set(tasks)) En caso de querer evitar duplicados desde el input (no me parece necesario ya que lo maneja un programador)
          users: users && users, //Array.from(new Set(users))
        },
        { new: true }
      );

      return { msg: "Project updated", updatedProject: updateProject };
    } catch (error) {
      throw error;
    }
  };

  public deleteProjectById = async (id: string) => {
    try {
      await this.getProjectById(id);

      await projectModel.findByIdAndDelete(id);

      return { msg: `Project with id ${id} was deleted` };
    } catch (error) {
      throw error;
    }
  };

  public assignUserToProject = async (projectId: string, userId: string) => {
    try {
      const [project, user] = await Promise.all([
        projectModel.findById(projectId),
        userModel.findById(userId),
      ]);

      if (!project) {
        throw CustomError.notFound(`Project with id ${projectId} not found`);
      }

      if (!user) {
        throw CustomError.notFound(`User with id ${userId} not found`);
      }

      if (project.users.includes(userId as unknown as ObjectId)) {
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

      return { msg: "OK", projectUpdated: updateProject };
    } catch (error) {
      throw error;
    }
  };
}
