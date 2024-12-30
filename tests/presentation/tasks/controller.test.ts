import { Request, Response } from "express";
import { TasksController } from "../../../src/presentation/tasks/controller";
import { TaskService } from "../../../src/application/services/tasks/service";
import { CustomError } from "../../../src/domain/errors/custom-errors";

describe("TasksController", () => {
  let tasksController: TasksController;
  let taskService: TaskService;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const customErrorSpy = jest.spyOn(CustomError, "handleErrors");

  beforeEach(() => {
    taskService = {
      getAllTasks: jest.fn(),
      getTaskById: jest.fn(),
      getTasksByName: jest.fn(),
      getTasksByDescription: jest.fn(),
      createTask: jest.fn(),
      updateTask: jest.fn(),
      changeTaskState: jest.fn(),
      assignTaskToUser: jest.fn(),
      deleteTask: jest.fn(),
    } as unknown as TaskService;

    tasksController = new TasksController(taskService);

    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe("getAllTasks", () => {
    it("should retrieve all tasks when service resolves", async () => {
      const tasks = [{ id: "676ff105faab8854b63521e5", name: "Test Task" }];
      mockRequest.query = { skip: "0", limit: "10" };

      (taskService.getAllTasks as jest.Mock).mockResolvedValue(tasks);

      await tasksController.getAllTasks(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(taskService.getAllTasks).toHaveBeenCalledWith(
        { status: undefined, endDate: undefined, userAssigned: undefined },
        { skip: 0, limit: 10 }
      );
      expect(mockResponse.json).toHaveBeenCalledWith(tasks);
    });

    it("should handle errors when service rejects", async () => {
      mockRequest.query = { skip: "0", limit: "10" };
      const mockError = new CustomError("Failed to fetch tasks", 400);

      (taskService.getAllTasks as jest.Mock).mockRejectedValue(mockError);

      await tasksController.getAllTasks(
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
        error: "Failed to fetch tasks",
      });
    });
  });

  describe("getTaskById", () => {
    it("should retrieve a task by ID when service resolves", async () => {
      const task = { id: "676ff105faab8854b63521e5", name: "Test Task" };
      mockRequest.params = { id: "676ff105faab8854b63521e5" };

      (taskService.getTaskById as jest.Mock).mockResolvedValue(task);

      await tasksController.getTaskById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(taskService.getTaskById).toHaveBeenCalledWith(
        "676ff105faab8854b63521e5"
      );
      expect(mockResponse.json).toHaveBeenCalledWith(task);
    });

    it("should handle errors when service rejects", async () => {
      const mockError = new CustomError("Task not found", 404);
      mockRequest.params = { id: "676ff105faab8854b63521e5" };

      (taskService.getTaskById as jest.Mock).mockRejectedValue(mockError);

      await tasksController.getTaskById(
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
        error: "Task not found",
      });
    });
  });

  describe("getTasksByName", () => {
    it("should retrieve tasks by name when service resolves", async () => {
      const tasks = [{ id: "676ff105faab8854b63521e5", name: "Test Task" }];
      mockRequest.params = { name: "Test Task" };

      (taskService.getTasksByName as jest.Mock).mockResolvedValue(tasks);

      await tasksController.getTasksByName(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(taskService.getTasksByName).toHaveBeenCalledWith("Test Task");
      expect(mockResponse.json).toHaveBeenCalledWith(tasks);
    });

    it("should handle errors when service rejects", async () => {
      const mockError = new CustomError("Tasks not found", 404);
      mockRequest.params = { name: "Test Task" };

      (taskService.getTasksByName as jest.Mock).mockRejectedValue(mockError);

      await tasksController.getTasksByName(
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
        error: "Tasks not found",
      });
    });
  });

  describe("getTasksByDescription", () => {
    it("should retrieve tasks by description when service resolves", async () => {
      const tasks = [
        { id: "676ff105faab8854b63521e5", description: "Task description 1" },
        { id: "676ff105faab8854b63521e4", description: "Task description 1" },
      ];
      mockRequest.params = { description: "Task description 1" };

      (taskService.getTasksByDescription as jest.Mock).mockResolvedValue(tasks);

      await tasksController.getTasksByDescription(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(taskService.getTasksByDescription).toHaveBeenCalledWith(
        "Task description 1"
      );
      expect(mockResponse.json).toHaveBeenCalledWith(tasks);
    });

    it("should handle errors when service rejects", async () => {
      const mockError = new CustomError("Tasks not found", 404);
      mockRequest.params = { description: "Task description 1" };

      (taskService.getTasksByDescription as jest.Mock).mockRejectedValue(
        mockError
      );

      await tasksController.getTasksByDescription(
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
        error: "Tasks not found",
      });
    });
  });

  describe("createTask", () => {
    it("should create a task when service resolves", async () => {
      const newTask = { id: "676ff105faab8854b63521e5", name: "New Task" };
      mockRequest.body = {
        name: "New Task",
        description: "Task description",
        assignedTo: "user1",
        status: "pending",
        endDate: new Date(),
        projectId: "project1",
      };

      (taskService.createTask as jest.Mock).mockResolvedValue(newTask);

      await tasksController.createTask(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(taskService.createTask).toHaveBeenCalledWith({
        name: "New Task",
        description: "Task description",
        assignedTo: "user1",
        status: "pending",
        endDate: mockRequest.body.endDate,
        projectId: "project1",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(newTask);
    });

    it("should handle errors when service rejects", async () => {
      mockRequest.body = {
        name: "New Task",
        description: "Task description",
        assignedTo: "user1",
        status: "pending",
        endDate: new Date(),
        projectId: "project1",
      };
      const mockError = new CustomError("Failed to create task", 400);

      (taskService.createTask as jest.Mock).mockRejectedValue(mockError);

      await tasksController.createTask(
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
        error: "Failed to create task",
      });
    });
  });

  describe("updateTask", () => {
    it("should update a task when service resolves", async () => {
      const updatedTask = {
        id: "676ff105faab8854b63521e5",
        name: "Updated Task",
      };
      mockRequest.params = { id: "676ff105faab8854b63521e5" };
      mockRequest.body = {
        name: "Updated Task",
        description: "Updated description",
        assignedTo: "user1",
        status: "in progress",
        endDate: new Date(),
        projectId: "project1",
      };

      (taskService.updateTask as jest.Mock).mockResolvedValue(updatedTask);

      await tasksController.updateTask(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(taskService.updateTask).toHaveBeenCalledWith(
        "676ff105faab8854b63521e5",
        {
          name: "Updated Task",
          description: "Updated description",
          assignedTo: "user1",
          status: "in progress",
          endDate: mockRequest.body.endDate,
          projectId: "project1",
        }
      );
      expect(mockResponse.json).toHaveBeenCalledWith(updatedTask);
    });

    it("should handle errors when service rejects", async () => {
      mockRequest.body = {
        name: "Updated Task",
        description: "Updated description",
        assignedTo: "user1",
        status: "in progress",
        endDate: new Date(),
        projectId: "project1",
      };
      mockRequest.params = { id: "676ff105faab8854b63521e5" };

      const mockError = new CustomError("Failed to update task", 400);

      (taskService.updateTask as jest.Mock).mockRejectedValue(mockError);

      await tasksController.updateTask(
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
        error: "Failed to update task",
      });
    });
  });

  describe("changeTaskState", () => {
    it("should change the task state when service resolves", async () => {
      const updatedStatus = {
        id: "676ff105faab8854b63521e5",
        status: "completed",
      };
      mockRequest.params = { id: "676ff105faab8854b63521e5" };
      mockRequest.body = { status: "completed" };

      (taskService.changeTaskState as jest.Mock).mockResolvedValue(
        updatedStatus
      );

      await tasksController.changeTaskState(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(taskService.changeTaskState).toHaveBeenCalledWith(
        "676ff105faab8854b63521e5",
        "completed"
      );
      expect(mockResponse.json).toHaveBeenCalledWith(updatedStatus);
    });

    it("should handle errors when service rejects", async () => {
      const mockError = new CustomError("Failed to change task state", 400);
      mockRequest.body = { status: "completed" };
      mockRequest.params = { id: "676ff105faab8854b63521e5" };

      (taskService.changeTaskState as jest.Mock).mockRejectedValue(mockError);

      await tasksController.changeTaskState(
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
        error: "Failed to change task state",
      });
    });
  });

  describe("assignTaskToUser", () => {
    it("should assign a task to a user when service resolves", async () => {
      const assignedTask = {
        taskId: "676ff105faab8854b63521e5",
        userId: "676ff105faab8854b63521e4",
      };
      mockRequest.params = {
        taskId: "676ff105faab8854b63521e5",
        userId: "676ff105faab8854b63521e4",
      };

      (taskService.assignTaskToUser as jest.Mock).mockResolvedValue(
        assignedTask
      );

      await tasksController.assignTaskToUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(taskService.assignTaskToUser).toHaveBeenCalledWith(
        "676ff105faab8854b63521e5",
        "676ff105faab8854b63521e4"
      );
      expect(mockResponse.json).toHaveBeenCalledWith(assignedTask);
    });

    it("should handle errors when service rejects", async () => {
      const mockError = new CustomError("Failed to assign task to user", 400);
      mockRequest.params = {
        taskId: "676ff105faab8854b63521e5",
        userId: "676ff105faab8854b63521e3",
      };

      (taskService.assignTaskToUser as jest.Mock).mockRejectedValue(mockError);

      await tasksController.assignTaskToUser(
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
        error: "Failed to assign task to user",
      });
    });
  });

  describe("deleteTask", () => {
    it("should delete a task when service resolves", async () => {
      const deletedTask = { success: true };
      mockRequest.params = { id: "676ff105faab8854b63521e5" };

      (taskService.deleteTask as jest.Mock).mockResolvedValue(deletedTask);

      await tasksController.deleteTask(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(taskService.deleteTask).toHaveBeenCalledWith(
        "676ff105faab8854b63521e5"
      );
      expect(mockResponse.json).toHaveBeenCalledWith(deletedTask);
    });

    it("should handle errors when service rejects", async () => {
      const mockError = new CustomError("Failed to delete task", 400);
      mockRequest.params = { id: "676ff105faab8854b63521e5" };

      (taskService.deleteTask as jest.Mock).mockRejectedValue(mockError);

      await tasksController.deleteTask(
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
        error: "Failed to delete task",
      });
    });
  });
});
