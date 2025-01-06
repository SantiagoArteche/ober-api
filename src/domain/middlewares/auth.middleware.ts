import { NextFunction, Request, Response } from "express";
import { JWT } from "../../infraestructure/config/jwt";
import { userModel } from "../../infraestructure/data/mongo-db/models/user.model";
import { JsonWebTokenError } from "jsonwebtoken";

export class AuthMiddleware {
  static validateJWT = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const headers = request.headers;

    const token = headers["x-auth"];

    if (!token) {
      return response
        .status(404)
        .json({ msg: "You need to login before use the API" });
    }

    try {
      const verifyToken = await JWT.decode(token.toString());

      if (!verifyToken) {
        return response.status(400).json({ msg: "Invalid Token" });
      }

      const findUser = await userModel.findOne({ email: verifyToken.email });

      if (!findUser) {
        return response.status(400).json({ msg: "Invalid Token" });
      }

      next();
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        return response.status(500).json({ msg: "Error validating token" });
      } else {
        return response.status(500).json({ msg: "Internal Server Error" });
      }
    }
  };
}
