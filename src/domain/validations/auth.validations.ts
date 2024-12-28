import { NextFunction, Request, Response } from "express";
import { body, param, validationResult } from "express-validator";

const handleAuthVal = (
  request: Request,
  response: Response,
  next: NextFunction
): any => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ msg: "ERROR", errors: errors.array() });
  }
  next();
};

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

  handleAuthVal,
];

export const logoutValidations = [
  param("token")
    .notEmpty()
    .withMessage("Token not provided")
    .isJWT()
    .withMessage("Invalid JWT"),

  handleAuthVal,
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

  handleAuthVal,
];

export const deleteUserValidations = [
  param("id")
    .notEmpty()
    .withMessage("Id is required")
    .isMongoId()
    .withMessage("Id must be in Mongo ID format"), // Specify UUID version if needed

  handleAuthVal,
];
