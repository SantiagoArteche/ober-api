import { Request, Response } from "express";
import { CustomError } from "../../../src/domain/errors/custom-errors";
import { ProjectService } from "../../../src/application/services/projects/service";
import { ProjectController } from "../../../src/presentation/projects/controller";

describe("ProjectController", () => {
  let projectController: ProjectController;
  let projectService: ProjectService;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const customErrorSpy = jest.spyOn(CustomError, "handleErrors");

  beforeEach(() => {
    projectService = {
      getAllProjects: jest.fn(),
      getProjectById: jest.fn(),
      createProject: jest.fn(),
      updateProject: jest.fn(),
      assignUserToProject: jest.fn(),
      deleteProjectById: jest.fn(),
    } as unknown as ProjectService;

    projectController = new ProjectController(projectService);

    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe("getAllProjects", () => {
    it("should return all projects when service resolves", async () => {
      const projects = [{ id: "676ff105faab8854b63521e5", name: "Project 1" }];
      mockRequest.query = { skip: "0", limit: "10" };

      (projectService.getAllProjects as jest.Mock).mockResolvedValue(projects);

      await projectController.getAllProjects(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(projectService.getAllProjects).toHaveBeenCalledWith({
        skip: 0,
        limit: 10,
      });
      expect(mockResponse.json).toHaveBeenCalledWith(projects);
    });

    it("should handle errors when service rejects", async () => {
      mockRequest.query = { skip: "0", limit: "10" };

      const mockError = new CustomError("Failed to fetch projects", 400);
      (projectService.getAllProjects as jest.Mock).mockRejectedValue(mockError);

      await projectController.getAllProjects(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(await customErrorSpy).toHaveBeenCalledTimes(1);
      expect(await customErrorSpy).toHaveBeenCalledWith(
        mockError,
        mockResponse
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.send).toHaveBeenCalledWith({
        msg: "ERROR",
        error: "Failed to fetch projects",
      });
    });
  });

  describe("getProjectById", () => {
    it("should return project details when service resolves", async () => {
      const project = { id: "676ff105faab8854b63521e5", name: "Project 1" };
      mockRequest.params = { id: "676ff105faab8854b63521e5" };

      (projectService.getProjectById as jest.Mock).mockResolvedValue(project);

      await projectController.getProjectById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(projectService.getProjectById).toHaveBeenCalledWith(
        "676ff105faab8854b63521e5"
      );
      expect(mockResponse.json).toHaveBeenCalledWith(project);
    });

    it("should handle errors when service rejects", async () => {
      mockRequest.params = { id: "676ff105faab8854b63521e5" };

      const mockError = new CustomError("Project not found", 404);
      (projectService.getProjectById as jest.Mock).mockRejectedValue(mockError);

      await projectController.getProjectById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(await customErrorSpy).toHaveBeenCalledTimes(1);
      expect(await customErrorSpy).toHaveBeenCalledWith(
        mockError,
        mockResponse
      );
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.send).toHaveBeenCalledWith({
        msg: "ERROR",
        error: "Project not found",
      });
    });
  });

  describe("createProject", () => {
    it("should create a project when service resolves", async () => {
      const newProject = { id: "676ff105faab8854b63521e5", name: "Project 1" };
      mockRequest.body = {
        name: "Project 1",
        users: ["676ff105faab8854b63521e2"],
      };

      (projectService.createProject as jest.Mock).mockResolvedValue(newProject);

      await projectController.createProject(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(projectService.createProject).toHaveBeenCalledWith({
        name: "Project 1",
        users: ["676ff105faab8854b63521e2"],
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(newProject);
    });

    it("should handle errors when service rejects", async () => {
      mockRequest.body = {
        name: "Project 1",
        users: ["676ff105faab8854b63521e2"],
      };

      const mockError = new CustomError("Failed to create project", 400);
      (projectService.createProject as jest.Mock).mockRejectedValue(mockError);

      await projectController.createProject(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(await customErrorSpy).toHaveBeenCalledTimes(1);
      expect(await customErrorSpy).toHaveBeenCalledWith(
        mockError,
        mockResponse
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.send).toHaveBeenCalledWith({
        msg: "ERROR",
        error: "Failed to create project",
      });
    });
  });

  describe("updateProject", () => {
    it("should update a project when service resolves", async () => {
      const updatedProject = {
        id: "676ff105faab8854b63521e2",
        name: "Updated Project",
        users: [],
      };
      mockRequest.params = { id: "676ff105faab8854b63521e2" };
      mockRequest.body = { name: "Updated Project", users: [] };

      (projectService.updateProject as jest.Mock).mockResolvedValue(
        updatedProject
      );

      await projectController.updateProject(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(projectService.updateProject).toHaveBeenCalledWith(
        "676ff105faab8854b63521e2",
        {
          name: "Updated Project",
          users: [],
        }
      );
      expect(mockResponse.json).toHaveBeenCalledWith(updatedProject);
    });

    it("should handle errors when service rejects", async () => {
      mockRequest.params = { id: "676ff105faab8854b63521e2" };
      mockRequest.body = { name: "Updated Project", users: [] };

      const mockError = new CustomError("Failed to update project", 400);
      (projectService.updateProject as jest.Mock).mockRejectedValue(mockError);

      await projectController.updateProject(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(await customErrorSpy).toHaveBeenCalledTimes(1);
      expect(await customErrorSpy).toHaveBeenCalledWith(
        mockError,
        mockResponse
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.send).toHaveBeenCalledWith({
        msg: "ERROR",
        error: "Failed to update project",
      });
    });
  });

  describe("assignUserToProject", () => {
    it("should assign a user to a project when service resolves", async () => {
      const assignResponse = { success: true };
      mockRequest.params = {
        projectId: "676ff105faab8854b63521e2",
        userId: "676ff105faab8854b63521e3",
      };

      (projectService.assignUserToProject as jest.Mock).mockResolvedValue(
        assignResponse
      );

      await projectController.assignUserToProject(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(projectService.assignUserToProject).toHaveBeenCalledWith(
        "676ff105faab8854b63521e2",
        "676ff105faab8854b63521e3"
      );
      expect(mockResponse.json).toHaveBeenCalledWith(assignResponse);
    });

    it("should handle errors when service rejects", async () => {
      mockRequest.params = {
        projectId: "676ff105faab8854b63521e2",
        userId: "676ff105faab8854b63521e3",
      };

      const mockError = new CustomError("Failed to assign user", 400);
      (projectService.assignUserToProject as jest.Mock).mockRejectedValue(
        mockError
      );

      await projectController.assignUserToProject(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(await customErrorSpy).toHaveBeenCalledTimes(1);
      expect(await customErrorSpy).toHaveBeenCalledWith(
        mockError,
        mockResponse
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.send).toHaveBeenCalledWith({
        msg: "ERROR",
        error: "Failed to assign user",
      });
    });
  });

  describe("deleteProject", () => {
    it("should delete a project when service resolves", async () => {
      mockRequest.params = { id: "676ff105faab8854b63521e2" };
      const deleteResponse = { success: true };

      (projectService.deleteProjectById as jest.Mock).mockResolvedValue(
        deleteResponse
      );

      await projectController.deleteProject(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(projectService.deleteProjectById).toHaveBeenCalledWith(
        "676ff105faab8854b63521e2"
      );
      expect(mockResponse.json).toHaveBeenCalledWith(deleteResponse);
    });

    it("should handle errors when service rejects", async () => {
      mockRequest.params = { id: "676ff105faab8854b63521e2" };

      const mockError = new CustomError("Failed to delete project", 400);
      (projectService.deleteProjectById as jest.Mock).mockRejectedValue(
        mockError
      );

      await projectController.deleteProject(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(await customErrorSpy).toHaveBeenCalledTimes(1);
      expect(await customErrorSpy).toHaveBeenCalledWith(
        mockError,
        mockResponse
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.send).toHaveBeenCalledWith({
        msg: "ERROR",
        error: "Failed to delete project",
      });
    });
  });
});
