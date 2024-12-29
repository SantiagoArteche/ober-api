import { Request, Response } from "express";
import { TaskService } from "../../application/services/tasks/service";
import { CustomError } from "../../domain/errors/custom-errors";

export class TasksController {
  constructor(public readonly taskService: TaskService) {}

  public getAllTasks = async (request: Request, response: Response) => {
    const {
      status,
      endDate,
      userAssigned,
      skip = 0,
      limit = 10,
    } = request.query;

    this.taskService
      .getAllTasks(
        {
          status: status as string,
          endDate: endDate as unknown as Date,
          userAssigned: userAssigned as string,
        },
        { skip: +skip, limit: +limit }
      )
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

  public getTasksByName = async (request: Request, response: Response) => {
    const { name } = request.params;

    this.taskService
      .getTasksByName(name)
      .then((tasks) => response.json(tasks))
      .catch((error) => CustomError.handleErrors(error, response));
  };

  public getTasksByDescription = async (
    request: Request,
    response: Response
  ) => {
    const { description } = request.params;

    this.taskService
      .getTasksByDescription(description)
      .then((tasks) => response.json(tasks))
      .catch((error) => CustomError.handleErrors(error, response));
  };

  public createTask = async (request: Request, response: Response) => {
    const { name, description, assignedTo, status, endDate, projectId } =
      request.body;

    this.taskService
      .createTask({ name, description, assignedTo, status, endDate, projectId })
      .then((newTask) => response.status(201).json(newTask))
      .catch((error) => CustomError.handleErrors(error, response));
  };

  public updateTask = async (request: Request, response: Response) => {
    const { id } = request.params;
    const { name, description, assignedTo, status, endDate, projectId } =
      request.body;

    this.taskService
      .updateTask(id, {
        name,
        description,
        assignedTo,
        status,
        endDate,
        projectId,
      })
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
