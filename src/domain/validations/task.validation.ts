import { body, param } from "express-validator";
import { handleValidation } from "./shared.validations";
import { CustomError } from "../errors/custom-errors";
import mongoose from "mongoose";
import { userModel } from "../../infraestructure/data/mongo-db/models/user.model";

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

export const createTaskValidation = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 3, max: 40 })
    .withMessage("Title must be between 3 and 40 characters long"),

  body("description")
    .isString()
    .withMessage("Title must be a string")
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

export const updateTaskValidation = [
  body("title")
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 3, max: 40 })
    .withMessage("Title must be between 3 and 40 characters long")
    .optional(),

  body("description")
    .isString()
    .withMessage("Title must be a string")
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
      console.log(task);
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
