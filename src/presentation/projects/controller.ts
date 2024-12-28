import { Request, Response } from "express";
import { ProjectService } from "../services/project.service";

export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  public getAllProjects = async (request: Request, response: Response) => {};
  public getProjectById = async (request: Request, response: Response) => {};
  public createProject = async (request: Request, response: Response) => {};
  public updateProject = async (request: Request, response: Response) => {};
  public assignUserToProject = async (
    request: Request,
    response: Response
  ) => {};
  public deleteProject = async (request: Request, response: Response) => {};
}
