import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

export const handleAuthVal = (
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
