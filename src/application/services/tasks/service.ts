import { CustomError } from "../../../domain/errors/custom-errors";
import { projectModel } from "../../../infraestructure/data/mongo-db/models/project.model";
import { taskModel } from "../../../infraestructure/data/mongo-db/models/task.model";
import { userModel } from "../../../infraestructure/data/mongo-db/models/user.model";
import { Task, TaskParams } from "./interfaces";
import { ObjectId } from "mongodb";
import { Pagination } from "../shared/interfaces";
import mongoose, { mongo } from "mongoose";

export class TaskService {
  public getAllTasks = async (
    { status, endDate, userAssigned }: TaskParams,
    { skip, limit }: Pagination
  ) => {
    try {
      const filters: any = {};

      if (status) {
        filters.status = status;
      }

      if (userAssigned) {
        filters.assignedTo = [userAssigned];
      }

      let allTasks = await taskModel.find(filters).limit(limit).skip(skip!);
      let totalDocuments = await taskModel.countDocuments(filters);

      if (endDate) {
        allTasks = allTasks.filter((task) => {
          const stringDate = task.endDate.toISOString().split("T")[0];
          return stringDate == endDate.toString();
        });
        totalDocuments = allTasks.length;
      }

      const currentPage = Math.ceil(skip! / limit + 1);
      const totalPages = Math.ceil(totalDocuments / limit);
      return {
        msg: "OK",
        tasks: allTasks,
        totalDocuments,
        limit,
        skip,
        page: currentPage,
        prev:
          currentPage > 1
            ? `http://localhost:8000/api/tasks?limit=${limit}&skip=${
                (currentPage - 2) * limit
              }`
            : null,
        next:
          currentPage < totalPages
            ? `http://localhost:8000/api/tasks?limit=${limit}&skip=${
                currentPage * limit
              }`
            : null,
      };
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw new Error("Error fetching tasks");
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

  public getTasksByName = async (name: string) => {
    try {
      const findTasks = await taskModel.find({ name }); //findOne en caso de desear una

      if (!findTasks.length) {
        throw CustomError.notFound(`Tasks with name ${name} not found`);
      }

      return { msg: "OK", task: findTasks };
    } catch (error) {
      throw error;
    }
  };

  public getTasksByDescription = async (description: string) => {
    try {
      const findTasks = await taskModel.find({ description }); //findOne en caso de desear una

      if (!findTasks) {
        throw CustomError.notFound(
          `Tasks with description ${description} not found`
        );
      }

      return { msg: "OK", task: findTasks };
    } catch (error) {
      throw error;
    }
  };

  public createTask = async (task: Task) => {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const findProject = await projectModel
        .findById(task.projectId)
        .session(session);

      if (!findProject) {
        throw CustomError.notFound(
          `Project with id ${task.projectId} not found`
        );
      }

      if (task.assignedTo?.length) {
        const usersId = task.assignedTo;

        const areUsersInProject = usersId.map(async (userId) => {
          const isUserInProject = await this.isUserInAnyProject(
            userId as unknown as ObjectId,
            task.projectId as unknown as ObjectId
          );

          if (!isUserInProject) {
            throw CustomError.conflict(
              `The user with id ${userId} is not working in the project ${task.projectId}`
            );
          }
        });

        await Promise.all(areUsersInProject);
      }

      const newTask = await taskModel.create([{ ...task }], { session });

      await projectModel.findByIdAndUpdate(
        task.projectId,
        {
          tasks: [...findProject.tasks, newTask[0]._id],
        },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      return { msg: "OK", newTask: newTask[0] };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  };

  public updateTask = async (id: string, task: Task) => {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const findTask = await this.getTaskById(id);

      if (task.projectId) {
        const findProject = await projectModel
          .findById(task.projectId)
          .session(session);

        if (!findProject) {
          throw CustomError.notFound(
            `Project with id ${task.projectId} not found`
          );
        }
      }

      if (task.assignedTo?.length) {
        const usersId = task.assignedTo;
        const areUsersInProject = usersId.map(async (userId) => {
          const isUserInProject = await this.isUserInAnyProject(
            userId as unknown as ObjectId,
            task.projectId
              ? (task.projectId as unknown as ObjectId)
              : findTask.task.projectId
          );

          if (!isUserInProject) {
            throw CustomError.conflict(
              `The user with id ${userId} is not working in the project ${task.projectId}`
            );
          }
        });

        await Promise.all(areUsersInProject);
      }

      const updatedTask = await taskModel.findByIdAndUpdate(
        id,
        {
          name: task.name && task.name,
          assignedTo: task.assignedTo && task.assignedTo,
          description: task.description && task.description,
          status: task.status && task.status,
          endDate: task.endDate && task.endDate,
          projectId: task.projectId && task.projectId,
        },
        { new: true, session }
      );

      if (task.projectId && updatedTask) {
        const previousProjectId = findTask.task.projectId;

        if (
          previousProjectId &&
          previousProjectId.toString() !== task.projectId.toString()
        ) {
          await projectModel.findByIdAndUpdate(
            previousProjectId,
            { $pull: { tasks: updatedTask._id } },
            { session }
          );
        }

        await projectModel.findByIdAndUpdate(
          task.projectId,
          { $addToSet: { tasks: updatedTask._id } },
          { session }
        );
      }

      await session.commitTransaction();
      session.endSession();

      return { msg: "OK", updatedTask };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
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
        userId as unknown as ObjectId,
        task.projectId
      );

      if (!isUserInProject) {
        throw CustomError.conflict(
          `The user with id ${userId} is not working in the project ${task.projectId}`
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
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      await this.getTaskById(id);

      const task = await taskModel.findByIdAndDelete(id, { session });

      if (!task) {
        throw CustomError.notFound(`Task with id ${id} not found`);
      }

      const findProject = await projectModel
        .findById(task.projectId)
        .session(session);

      if (findProject) {
        await projectModel.findByIdAndUpdate(
          findProject.id,
          {
            tasks: findProject.tasks.filter(
              (taskId) => taskId.toString() !== id.toString()
            ),
          },
          { session }
        );
      }

      await session.commitTransaction();
      session.endSession();
      return { msg: `Task with id ${id} was deleted` };
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  };

  private isUserInAnyProject = async (
    userId: ObjectId,
    projectId: ObjectId
  ): Promise<boolean> => {
    const findProject = await projectModel.findById(projectId);

    return !!findProject?.users.includes(userId);
  };
}
