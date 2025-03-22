import { Response, Request } from "express";

import { CustomError } from "../../domain/errors/custom-errors";
import { AuthService } from "../../application/services/auth/service";

export class AuthController {
  constructor(public readonly authService: AuthService) {}

  public getUsers = async (request: Request, response: Response) => {
    this.authService
      .getUsers()
      .then((users) => response.status(200).json(users))
      .catch((error) => CustomError.handleErrors(error, response));
  };

  public createUser = async (request: Request, response: Response) => {
    const { name, email, password } = request.body;

    this.authService
      .createUser({ name, email, password })
      .then((newUser) => response.status(201).json(newUser))
      .catch((error) => CustomError.handleErrors(error, response));
  };

  public deleteUser = async (request: Request, response: Response) => {
    const { id } = request.params;

    this.authService
      .deleteUser(id)
      .then((wasDeleted) => response.json(wasDeleted))
      .catch((error) => CustomError.handleErrors(error, response));
  };

  public login = async (request: Request, response: Response) => {
    const { email, password } = request.body;

    this.authService
      .login({ email, password })
      .then((login) => {
        response.cookie("auth_token", login.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 2 * 60 * 60 * 1000,
        });

        return response.json(login);
      })
      .catch((error) => CustomError.handleErrors(error, response));
  };

  public logout = async (request: Request, response: Response) => {
    const { token } = request.params;

    this.authService
      .logout(token)
      .then((logout) => {
        response.clearCookie("auth_token");
        return response.json(logout);
      })
      .catch((error) => CustomError.handleErrors(error, response));
  };
}
