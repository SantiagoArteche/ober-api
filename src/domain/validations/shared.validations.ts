import { NextFunction, Request, Response } from "express";
import { validationResult, param } from "express-validator";

export const handleValidation = (
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

export const idValidation = [
  param("id")
    .notEmpty()
    .withMessage("Id is required")
    .isMongoId()
    .withMessage("Id must be in Mongo ID format"),

  handleValidation,
];
