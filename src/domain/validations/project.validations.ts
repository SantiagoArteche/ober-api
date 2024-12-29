import { body, param, query } from "express-validator";
import { handleValidation } from "./shared.validations";
import mongoose from "mongoose";
import { userModel } from "../../infraestructure/data/mongo-db/models/user.model";
import { taskModel } from "../../infraestructure/data/mongo-db/models/task.model";
import { CustomError } from "../errors/custom-errors";

const taskAndUserValidation = [
  body("users")
    .isArray()
    .withMessage("Users must be an array with the id of the users")
    .custom(async (users) => {
      for (const userId of users) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          throw CustomError.badRequest(
            `User ID ${userId} is not a valid ObjectId`
          );
        }

        const findUser = await userModel.findById(userId);
        if (!findUser) {
          throw CustomError.notFound(`User with id ${userId} not found`);
        }
      }
      return true;
    })
    .optional(),

  body("tasks")
    .isArray()
    .withMessage("Tasks must be an array with the id of the tasks")
    .custom(async (tasks) => {
      for (const taskId of tasks) {
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
          throw CustomError.badRequest(
            `Task ID ${taskId} is not a valid ObjectId`
          );
        }

        const findTask = await taskModel.findById(taskId);
        if (!findTask) {
          throw CustomError.notFound(`Task with id ${taskId} not found`);
        }
      }
      return true;
    })
    .optional(),
];

export const getAllProjectsValidation = [
  query("skip")
    .isNumeric()
    .withMessage("skip must be a number")
    .optional()
    .custom((skip) => {
      if (skip < 0) {
        throw CustomError.badRequest(`Skip must be greater or equal than 0`);
      }

      return true;
    }),

  query("limit")
    .isNumeric()
    .withMessage("limit must be a number")
    .optional()
    .custom((limit) => {
      if (limit < 0) {
        throw CustomError.badRequest(`Limit must be greater or equal than 0`);
      }

      return true;
    }),
  handleValidation,
];

export const createProjectValidation = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 3, max: 40 })
    .withMessage("Name must be between 3 and 40 characters long"),

  ...taskAndUserValidation,

  handleValidation,
];

export const updateProjectValidation = [
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 3, max: 40 })
    .withMessage("Name must be between 3 and 40 characters long")
    .optional(),

  ...taskAndUserValidation,
  handleValidation,
];

export const assignUserToProjectValidation = [
  param("userId")
    .notEmpty()
    .withMessage("userId is required")
    .isMongoId()
    .withMessage("userId must be in Mongo ID format"),

  param("projectId")
    .notEmpty()
    .withMessage("projectId is required")
    .isMongoId()
    .withMessage("projectId must be in Mongo ID format"),

  handleValidation,
];
