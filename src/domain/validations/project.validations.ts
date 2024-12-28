import { body, param } from "express-validator";
import { handleAuthVal } from "./shared.validations";
import mongoose from "mongoose";
import { userModel } from "../../infraestructure/data/mongo-db/models/user.model";
import { taskModel } from "../../infraestructure/data/mongo-db/models/task.model";

export const idValidation = [
  param("id")
    .notEmpty()
    .withMessage("Id is required")
    .isMongoId()
    .withMessage("Id must be in Mongo ID format"),

  handleAuthVal,
];

const taskAndUserValidation = [
  body("users")
    .isArray()
    .withMessage("Users must be an array with the id of the users")
    .custom(async (users) => {
      for (const userId of users) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          throw new Error(`User ID ${userId} is not a valid ObjectId`);
        }

        const findUser = await userModel.findById(userId);
        if (!findUser) {
          throw new Error(`User with id ${userId} not found`);
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
          throw new Error(`Task ID ${taskId} is not a valid ObjectId`);
        }

        const findTask = await taskModel.findById(taskId);
        if (!findTask) {
          throw new Error(`Task with id ${taskId} not found`);
        }
      }
      return true;
    })
    .optional(),
];

export const createProjectValidation = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string"),

  ...taskAndUserValidation,

  handleAuthVal,
];

export const updateProjectValidation = [
  body("name").isString().withMessage("Name must be a string").optional(),
  ...taskAndUserValidation,
  handleAuthVal,
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

  handleAuthVal,
];
