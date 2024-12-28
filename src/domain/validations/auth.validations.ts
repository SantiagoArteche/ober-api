import { body, param } from "express-validator";
import { handleValidation } from "./shared.validations";

export const loginValidations = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Wrong email format"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isString()
    .withMessage("Password must be a string"),

  handleValidation,
];

export const logoutValidations = [
  param("token")
    .notEmpty()
    .withMessage("Token not provided")
    .isJWT()
    .withMessage("Invalid JWT"),

  handleValidation,
];

export const createUserValidations = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3, max: 40 })
    .withMessage("Name must be between 3 and 40 characters long"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Wrong email format"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isString()
    .withMessage("Password must be a string"),

  handleValidation,
];
