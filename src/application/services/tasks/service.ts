import { CustomError } from "../../../domain/errors/custom-errors";
import { projectModel } from "../../../infraestructure/data/mongo-db/models/project.model";
import { taskModel } from "../../../infraestructure/data/mongo-db/models/task.model";
import { userModel } from "../../../infraestructure/data/mongo-db/models/user.model";
import { Task, TaskParams } from "./interfaces";
import { ObjectId } from "mongodb";
import { Pagination } from "../shared/interfaces";
import mongoose from "mongoose";
import { Logger } from "../../../infraestructure/config/logger";

export class TaskService {
  constructor(private readonly logger: Logger = new Logger()) {}

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

      let allTasks = await taskModel
        .find(filters)
        .limit(limit)
        .skip(skip!)
        .populate("projectId", "_id name")
        .populate("assignedTo", "_id name");

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

      this.logger.info(
        `Tasks fetched successfully ${JSON.stringify({
          totalDocuments,
          currentPage,
          totalPages,
        })}`
      );

      return {
        msg: "OK",
        tasks: allTasks,
        totalDocuments,
        totalPages,
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
      this.logger.error(`Error fetching tasks: ${error}`);
      throw error;
    }
  };

  public getTaskById = async (id: string) => {
    try {
      const findTask = await taskModel
        .findById(id)
        .populate("assignedTo", "_id name")
        .populate("projectId", "_id name");

      if (!findTask) {
        this.logger.warning(`Task with id ${id} not found`);
        throw CustomError.notFound(`Task with id ${id} not found`);
      }

      this.logger.info("Task fetched successfully " + id);
      return { msg: "OK", task: findTask };
    } catch (error) {
      this.logger.error(
        "Error fetching task by id " + JSON.stringify({ id, error })
      );
      throw error;
    }
  };

  public getTasksByName = async (name: string) => {
    try {
      const findTasks = await taskModel.find({ name });

      if (!findTasks.length) {
        this.logger.warning(`Tasks with name ${name} not found`);
        throw CustomError.notFound(`Tasks with name ${name} not found`);
      }

      this.logger.info(
        "Tasks fetched successfully by name " + JSON.stringify({ name })
      );
      return { msg: "OK", task: findTasks };
    } catch (error) {
      this.logger.error(
        "Error fetching tasks by name " + JSON.stringify({ name, error })
      );
      throw error;
    }
  };

  public getTasksByDescription = async (description: string) => {
    try {
      const findTasks = await taskModel.find({ description });

      if (!findTasks.length) {
        this.logger.warning(
          `Tasks with description ${description} not found    `
        );
        throw CustomError.notFound(
          `Tasks with description ${description} not found`
        );
      }

      this.logger.info(
        "Tasks fetched successfully by description " +
          JSON.stringify({
            description,
          })
      );
      return { msg: "OK", task: findTasks };
    } catch (error) {
      this.logger.error(
        "Error fetching tasks by description " +
          JSON.stringify({
            description,
            error,
          })
      );
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
        this.logger.warning(`Project with id ${task.projectId} not found`);
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
            this.logger.warning(
              `The user with id ${userId} is not working in the project ${task.projectId}`
            );
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
      this.logger.info(
        "Task created successfully " + JSON.stringify({ newTask: newTask[0] })
      );
      return { msg: "OK", newTask: newTask[0] };
    } catch (error) {
      await session.abortTransaction();
      this.logger.error("Error creating task " + JSON.stringify({ error }));
      throw error;
    } finally {
      session.endSession();
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
          this.logger.warning(`Project with id ${task.projectId} not found`);
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
            this.logger.warning(
              `User with id ${userId} is not part of project ${
                task.projectId || findTask.task.projectId
              }`
            );
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

      this.logger.info(
        `Task with id ${id} updated successfully - ${JSON.stringify({
          updatedTask,
        })}`
      );

      return { msg: "OK", updatedTask };
    } catch (error) {
      await session.abortTransaction();
      this.logger.error(
        `Error updating task with id ${id} - ${JSON.stringify({
          error,
        })}`
      );
      throw error;
    } finally {
      session.endSession();
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

      this.logger.info(
        "Task state changed successfully " + JSON.stringify({ status })
      );

      return { msg: "Status updated", updateTaskState };
    } catch (error) {
      this.logger.error(
        "Error creating changing task state " + JSON.stringify({ error })
      );
      throw error;
    }
  };

  public assignTaskToUser = async (taskId: string, userId: string) => {
    try {
      this.logger.info(
        "Assigning user to task " + JSON.stringify({ taskId, userId })
      );

      const [task, user] = await Promise.all([
        taskModel.findById(taskId),
        userModel.findById(userId).populate("assignedTo", "_id name"),
      ]);

      if (!task) {
        this.logger.warning("Task not found for assignment " + taskId);
        throw CustomError.notFound(`Task with id ${taskId} not found`);
      }

      if (!user) {
        this.logger.warning("User not found for assignment " + userId);
        throw CustomError.notFound(`User with id ${userId} not found`);
      }

      const isUserInProject = await this.isUserInAnyProject(
        userId as unknown as ObjectId,
        task.projectId
      );

      if (!isUserInProject) {
        this.logger.warning(
          "User not in project for task assignment " +
            JSON.stringify({ userId, projectId: task.projectId })
        );
        throw CustomError.conflict(
          `The user with id ${userId} is not working in the project ${task.projectId}`
        );
      }

      if (task.assignedTo.includes(userId as unknown as ObjectId)) {
        this.logger.warning(
          "User already assigned to task " + JSON.stringify({ taskId, userId })
        );
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

      this.logger.info(
        "User assigned to task successfully " +
          JSON.stringify({ taskId, userId })
      );
      return { msg: "User assigned", task: assignTask };
    } catch (error) {
      this.logger.error(
        "Error assigning user to task " +
          JSON.stringify({ taskId, userId, error })
      );
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
        this.logger.warning("Task not found for deletion " + id);
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
      this.logger.info("Task deleted successfully " + id);
      return { msg: `Task with id ${id} was deleted` };
    } catch (error) {
      await session.abortTransaction();
      this.logger.error("Error deleting task " + JSON.stringify({ id, error }));
      throw error;
    } finally {
      session.endSession();
    }
  };

  public isUserInAnyProject = async (
    userId: ObjectId,
    projectId: ObjectId
  ): Promise<boolean> => {
    try {
      this.logger.info(
        "Checking if user is in any project " +
          JSON.stringify({
            userId,
            projectId,
          })
      );
      const findProject = await projectModel.findById(projectId);
      return !!findProject?.users.includes(userId);
    } catch (error) {
      this.logger.error(
        "Error checking user in project " +
          JSON.stringify({
            userId,
            projectId,
            error,
          })
      );
      throw error;
    }
  };
}
