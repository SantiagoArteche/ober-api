import { Response, Request } from "express";
import { AuthService } from "../services/auth.service";

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  public createUser = async (request: Request, response: Response) => {};
  public deleteUser = async (request: Request, response: Response) => {};

  public login = async (request: Request, response: Response) => {};
  public logout = async (request: Request, response: Response) => {};
}
