import { Response, Request } from "express";

import { createUser, deleteUser, login, logout } from "../../application/auth";
import { CustomError } from "../../domain/errors/custom-errors";

export class AuthController {
  public createUser = async (request: Request, response: Response) => {
    const { name, email, password } = request.body;

    createUser({ name, email, password })
      .then((newUser) => response.status(201).json(newUser))
      .catch((error) => CustomError.handleErrors(error, response));
  };

  public deleteUser = async (request: Request, response: Response) => {
    const { id } = request.params;

    deleteUser(id)
      .then((wasDeleted) => response.json(wasDeleted))
      .catch((error) => CustomError.handleErrors(error, response));
  };

  public login = async (request: Request, response: Response) => {
    const { email, password } = request.body;

    login({ email, password })
      .then((login) => {
        response.setHeader("x-auth", login.token);
        return response.json(login);
      })
      .catch((error) => CustomError.handleErrors(error, response));
  };

  public logout = async (request: Request, response: Response) => {
    const { token } = request.params;

    logout(token)
      .then((logout) => {
        response.removeHeader("x-auth");
        return response.json(logout);
      })
      .catch((error) => CustomError.handleErrors(error, response));
  };
}
