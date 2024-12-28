import { Request, Response } from "express";
import { TaskService } from "../../application/services/tasks/service";
import { CustomError } from "../../domain/errors/custom-errors";

export class TasksController {
  constructor(public readonly taskService: TaskService) {}

  public getAllTasks = async (request: Request, response: Response) => {
    this.taskService
      .getAllTasks()
      .then((tasks) => response.json(tasks))
      .catch((error) => CustomError.handleErrors(error, response));
  };
  public getTaskById = async (request: Request, response: Response) => {
    const { id } = request.params;

    this.taskService
      .getTaskById(id)
      .then((task) => response.json(task))
      .catch((error) => CustomError.handleErrors(error, response));
  };

  public createTask = async (request: Request, response: Response) => {
    const { title, description, assignedTo, status } = request.body;

    this.taskService
      .createTask({ title, description, assignedTo, status })
      .then((newTask) => response.status(201).json(newTask))
      .catch((error) => CustomError.handleErrors(error, response));
  };

  public updateTask = async (request: Request, response: Response) => {
    const { id } = request.params;
    const { title, description, assignedTo, status } = request.body;

    this.taskService
      .updateTask(id, { title, description, assignedTo, status })
      .then((updatedTask) => response.json(updatedTask))
      .catch((error) => CustomError.handleErrors(error, response));
  };

  public changeTaskState = async (request: Request, response: Response) => {
    const { id } = request.params;
    const { status } = request.body;
    this.taskService
      .changeTaskState(id, status)
      .then((updateTaskStatus) => response.json(updateTaskStatus))
      .catch((error) => CustomError.handleErrors(error, response));
  };

  public assignTaskToUser = async (request: Request, response: Response) => {
    const { userId, taskId } = request.params;
    this.taskService
      .assignTaskToUser(taskId, userId)
      .then((assignedTask) => response.json(assignedTask))
      .catch((error) => CustomError.handleErrors(error, response));
  };

  public deleteTask = async (request: Request, response: Response) => {
    const { id } = request.params;

    this.taskService
      .deleteTask(id)
      .then((deleted) => response.json(deleted))
      .catch((error) => CustomError.handleErrors(error, response));
  };
}
