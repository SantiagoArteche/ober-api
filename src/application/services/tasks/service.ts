import { CustomError } from "../../../domain/errors/custom-errors";
import { projectModel } from "../../../infraestructure/data/mongo-db/models/project.model";
import { taskModel } from "../../../infraestructure/data/mongo-db/models/task.model";
import { userModel } from "../../../infraestructure/data/mongo-db/models/user.model";
import { Task } from "./interfaces";
import { ObjectId } from "mongodb";

export class TaskService {
  public getAllTasks = async () => {
    try {
      const allTasks = await taskModel.find();

      return { msg: "OK", tasks: allTasks };
    } catch (error) {
      throw error;
    }
  };

  public getTaskById = async (id: string) => {
    try {
      const findTask = await taskModel.findById(id);

      if (!findTask) throw CustomError.notFound(`Task with id ${id} not found`);

      return { msg: "OK", task: findTask };
    } catch (error) {
      throw error;
    }
  };

  public createTask = async (task: Task) => {
    try {
      const newTask = await taskModel.create(task);

      if (task.assignedTo.length > 0) {
        const usersId = task.assignedTo;
        const areUsersInProject = usersId.map(async (userId) => {
          const isUserInProject = await this.isUserInAnyProject(
            userId as unknown as ObjectId
          );
          if (!isUserInProject) {
            throw CustomError.conflict(
              `The user with id ${userId} is not working in any project`
            );
          }
        });

        await Promise.all(areUsersInProject);
      }

      return { msg: "OK", newTask };
    } catch (error) {
      throw error;
    }
  };

  public updateTask = async (id: string, task: Task) => {
    try {
      await this.getTaskById(id);

      if (task.assignedTo.length > 0) {
        const usersId = task.assignedTo;
        const areUsersInProject = usersId.map(async (userId) => {
          const isUserInProject = await this.isUserInAnyProject(
            userId as unknown as ObjectId
          );
          if (!isUserInProject) {
            throw CustomError.conflict(
              `The user with id ${userId} is not working in any project`
            );
          }
        });

        await Promise.all(areUsersInProject);
      }

      const newTask = await taskModel.findByIdAndUpdate(
        id,
        {
          title: task.title && task.title,
          assignedTo: task.assignedTo && task.assignedTo,
          description: task.description && task.description,
          status: task.status && task.status,
        },
        { new: true }
      );

      return { msg: "OK", newTask };
    } catch (error) {
      throw error;
    }
  };

  public changeTaskState = async (id: string, status: Task["status"]) => {
    try {
      await this.getTaskById(id);

      const updateTaskState = await taskModel.findByIdAndUpdate(
        id,
        {
          status: status,
        },
        { new: true }
      );

      return { msg: "Status updated", updateTaskState };
    } catch (error) {
      throw error;
    }
  };

  public assignTaskToUser = async (taskId: string, userId: string) => {
    try {
      const [task, user] = await Promise.all([
        taskModel.findById(taskId),
        userModel.findById(userId),
      ]);

      if (!task) throw CustomError.notFound(`Task with id ${taskId} not found`);

      if (!user) throw CustomError.notFound(`User with id ${userId} not found`);

      const isUserInProject = await this.isUserInAnyProject(
        userId as unknown as ObjectId
      );

      if (!isUserInProject) {
        throw CustomError.conflict(
          `The user with id ${userId} is not working in any project`
        );
      }

      if (task.assignedTo.includes(userId as unknown as ObjectId)) {
        throw CustomError.conflict(
          `User with id ${userId} is already working in the task`
        );
      }

      const assignTask = await taskModel.findByIdAndUpdate(
        taskId,
        {
          assignedTo: [...task.assignedTo, userId],
        },
        { new: true }
      );

      return { msg: "User assigned", task: assignTask };
    } catch (error) {
      throw error;
    }
  };

  public deleteTask = async (id: string) => {
    try {
      await this.getTaskById(id);

      await taskModel.findByIdAndDelete(id);

      return { msg: `Task with id ${id} was deleted` };
    } catch (error) {
      throw error;
    }
  };

  private isUserInAnyProject = async (userId: ObjectId): Promise<boolean> => {
    const projectCount = await projectModel.countDocuments({ users: userId });
    return projectCount > 0;
  };
}
