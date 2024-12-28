import { TaskService } from "../services/task.service";
import { Request, Response } from "express";

export class TasksController {
  private taskService: TaskService;

  constructor(taskService: TaskService) {
    this.taskService = taskService;
  }

  public getAllTasks = async (request: Request, response: Response) => {};
  public getTaskById = async (request: Request, response: Response) => {};
  public createTask = async (request: Request, response: Response) => {};
  public updateTask = async (request: Request, response: Response) => {};
  public changeTaskState = async (request: Request, response: Response) => {};
  public assignTaskToUser = async (request: Request, response: Response) => {};
  public deleteTask = async (request: Request, response: Response) => {};
}
