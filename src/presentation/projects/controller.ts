import { Request, Response } from "express";

import { CustomError } from "../../domain/errors/custom-errors";

import { ProjectService } from "../../application/services/projects/service";

export class ProjectController {
  constructor(public readonly projectService: ProjectService) {}

  public getAllProjects = async (request: Request, response: Response) => {
    const { skip = 0, limit = 10 } = request.query;

    this.projectService
      .getAllProjects({ skip: +skip, limit: +limit })
      .then((projects) => response.json(projects))
      .catch((error) => CustomError.handleErrors(error, response));
  };
  public getProjectById = async (request: Request, response: Response) => {
    const { id } = request.params;

    this.projectService
      .getProjectById(id)
      .then((project) => response.json(project))
      .catch((error) => CustomError.handleErrors(error, response));
  };
  public createProject = async (request: Request, response: Response) => {
    const { name, users } = request.body;

    this.projectService
      .createProject({ name, users })
      .then((project) => response.status(201).json(project))
      .catch((error) => CustomError.handleErrors(error, response));
  };

  public updateProject = async (request: Request, response: Response) => {
    const { id } = request.params;
    const { name, users } = request.body;

    this.projectService
      .updateProject(id, { name, users })
      .then((updated) => response.json(updated))
      .catch((error) => CustomError.handleErrors(error, response));
  };

  public assignUserToProject = async (request: Request, response: Response) => {
    const { projectId, userId } = request.params;

    this.projectService
      .assignUserToProject(projectId, userId)
      .then((assign) => response.json(assign))
      .catch((error) => CustomError.handleErrors(error, response));
  };

  public deleteProject = async (request: Request, response: Response) => {
    const { id } = request.params;

    this.projectService
      .deleteProjectById(id)
      .then((deleted) => response.json(deleted))
      .catch((error) => CustomError.handleErrors(error, response));
  };
}
