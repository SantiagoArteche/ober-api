import { body, param, query } from "express-validator";
import { handleValidation } from "./shared.validations";
import { CustomError } from "../errors/custom-errors";
import mongoose from "mongoose";
import { userModel } from "../../infraestructure/data/mongo-db/models/user.model";
import { projectModel } from "../../infraestructure/data/mongo-db/models/project.model";

const assignedToValidation = [
  body("assignedTo")
    .isArray()
    .withMessage("assignedTo must be an array with the id of the users")
    .custom(async (user) => {
      for (const userId of user) {
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
];

export const getAllTasksValidation = [
  query("userAssigned")
    .isMongoId()
    .withMessage("userAssigned must be in Mongo ID format (User ID)")
    .optional(),

  query("endDate")
    .isDate()
    .withMessage("endDate must be in Date format")
    .optional(),

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

  query("status")
    .isString()
    .withMessage("status must be a string")
    .custom((task) => {
      const validTasks = ["pending", "in progress", "completed"];
      if (!validTasks.includes(task)) {
        throw CustomError.badRequest(
          `Invalid status, valid ones are: [${validTasks}]`
        );
      }

      return true;
    })
    .optional(),
  handleValidation,
];

export const createTaskValidation = [
  body("name")
    .notEmpty()
    .withMessage("name is required")
    .isString()
    .withMessage("name must be a string")
    .isLength({ min: 3, max: 40 })
    .withMessage("name must be between 3 and 40 characters long"),

  body("description")
    .isString()
    .withMessage("description must be a string")
    .optional(),

  body("projectId")
    .notEmpty()
    .withMessage("projectId is required")
    .isMongoId()
    .withMessage("projectId must be in Mongo ID format"),

  body("endDate")
    .notEmpty()
    .withMessage("endDate is required")
    .isDate()
    .withMessage("endDate must be a date"),

  body("status")
    .isString()
    .withMessage("Status must be a string")
    .custom((task) => {
      const validTasks = ["pending", "in progress", "completed"];
      if (!validTasks.includes(task)) {
        throw CustomError.badRequest(
          `Invalid status, valid ones are: [${validTasks}]`
        );
      }

      return true;
    })
    .optional(),

  ...assignedToValidation,
  handleValidation,
];

export const updateTaskValidation = [
  body("name")
    .isString()
    .withMessage("name must be a string")
    .isLength({ min: 3, max: 40 })
    .withMessage("name must be between 3 and 40 characters long")
    .optional(),

  body("endDate").isDate().withMessage("endDate must be a date").optional(),

  body("projectId")
    .notEmpty()
    .withMessage("projectId is required")
    .isMongoId()
    .withMessage("projectId must be in Mongo ID format")
    .optional(),

  body("description")
    .isString()
    .withMessage("name must be a string")
    .optional(),

  body("status")
    .isString()
    .withMessage("Status must be a string")
    .custom((task) => {
      const validTasks = ["pending", "in progress", "completed"];
      if (!validTasks.includes(task)) {
        throw CustomError.badRequest(
          `Invalid status, valid ones are: [${validTasks}]`
        );
      }

      return true;
    })
    .optional(),

  ...assignedToValidation,
  handleValidation,
];

export const changeTaskStateValidation = [
  param("id")
    .notEmpty()
    .withMessage("userId is required")
    .isMongoId()
    .withMessage("userId must be in Mongo ID format"),

  body("status")
    .notEmpty()
    .withMessage("status is required")
    .isString()
    .withMessage("status must be a string")
    .custom((task) => {
      const validTasks = ["pending", "in progress", "completed"];

      if (!validTasks.includes(task)) {
        throw CustomError.badRequest(
          `Invalid status, valid ones are: [${validTasks}]`
        );
      }

      return true;
    }),
  handleValidation,
];

export const assignTaskToUserValidation = [
  param("userId")
    .notEmpty()
    .withMessage("userId is required")
    .isMongoId()
    .withMessage("userId must be in Mongo ID format"),

  param("taskId")
    .notEmpty()
    .withMessage("taskId is required")
    .isMongoId()
    .withMessage("taskId must be in Mongo ID format"),

  handleValidation,
];

export const getTasksByNameValidation = [
  param("name")
    .notEmpty()
    .withMessage("name is required")
    .isString()
    .withMessage("name must be a string"),

  handleValidation,
];

export const getTasksByDescriptionValidation = [
  param("description")
    .notEmpty()
    .withMessage("description is required")
    .isString()
    .withMessage("description must be a string"),

  handleValidation,
];
