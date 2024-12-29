import { NextFunction, Request, Response } from "express";
import { JWT } from "../../infraestructure/config/jwt";
import { userModel } from "../../infraestructure/data/mongo-db/models/user.model";

export class AuthMiddleware {
  static validateJWT = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const headers = request.headers;
    const cookie = headers.cookie;

    const findAuthToken = cookie
      ?.split(";")
      .find((cookie) => cookie.trim().startsWith("auth_token"));

    if (!findAuthToken) {
      return response
        .status(404)
        .json({ msg: "You need to login before use the API" });
    }

    const token = findAuthToken.split("=")[1];

    const verifyToken = await JWT.decode(token);

    if (!verifyToken) {
      return response.status(400).json({ msg: "Invalid Token" });
    }

    const findUser = await userModel.findOne({ email: verifyToken.email });

    if (!findUser) {
      return response.status(400).json({ msg: "Invalid Token" });
    }

    next();
  };
}
