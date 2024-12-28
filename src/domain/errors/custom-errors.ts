import { Response } from "express";

export class CustomError extends Error {
  constructor(public message: string, public status: number) {
    super(message);
  }

  static badRequest(message: string) {
    return new CustomError(message, 400);
  }

  static unauthorized(message: string) {
    return new CustomError(message, 401);
  }

  static payRequired(message: string) {
    return new CustomError(message, 402);
  }

  static forbidden(message: string) {
    return new CustomError(message, 403);
  }

  static notFound(message: string) {
    return new CustomError(message, 404);
  }

  static conflict(message: string) {
    return new CustomError(message, 409);
  }

  static internalServerError(message: string) {
    return new CustomError(message, 500);
  }

  static handleErrors(error: unknown, response: Response) {
    if (error instanceof CustomError) {
      return response.status(error.status).send({
        msg: "ERROR",
        error: error.message,
      });
    } else {
      return response.status(500).send({
        msg: "ERROR",
        error: "Internal Server Error",
      });
    }
  }
}
