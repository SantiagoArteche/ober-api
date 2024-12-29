import { JsonWebTokenError } from "jsonwebtoken";
import { CustomError } from "../../../domain/errors/custom-errors";
import { Hash } from "../../../infraestructure/config/bcrypt";
import { JWT } from "../../../infraestructure/config/jwt";
import { userModel } from "../../../infraestructure/data/mongo-db/models/user.model";
import { User, Credentials } from "./interfaces";

export class AuthService {
  public createUser = async (userData: User) => {
    try {
      const findUser = await userModel.findOne({ email: userData.email });

      if (findUser) {
        throw CustomError.badRequest(
          `User with email ${userData.email} already exists`
        );
      }

      const newUser = await userModel.create({
        ...userData,
        password: Hash.hashPassword(userData.password),
      });

      return {
        msg: "User created",
        newUser: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
        },
      };
    } catch (error) {
      throw error;
    }
  };

  public deleteUser = async (id: string) => {
    try {
      const findUser = await userModel.findById(id);

      if (!findUser) {
        throw CustomError.notFound(`User with id ${id} not found`);
      }

      await userModel.findByIdAndDelete(id);

      return { msg: `User with id ${id} was deleted` };
    } catch (error) {
      throw error;
    }
  };

  public login = async (credentials: Credentials) => {
    try {
      const findUserByEmail = await userModel.findOne({
        email: credentials.email,
      });

      if (!findUserByEmail) {
        throw CustomError.unauthorized(`Wrong credentials`); // Se que iría 404 not found,
        // pero utilizo esto para no dar pistas si existe o no el usuario con el email (en caso de atacantes)
      }

      if (
        !Hash.unHashPassword(credentials.password, findUserByEmail.password)
      ) {
        throw CustomError.unauthorized(`Wrong credentials`);
        // No se da pistas si lo que esta mal es el email o el password.
      }

      const token = await JWT.generate(
        {
          id: findUserByEmail._id.toString(),
          email: credentials.email,
        },
        "2h"
      );

      if (!token) {
        throw CustomError.internalServerError(`JWT error`);
      }

      return { msg: "Successfull login", token };
    } catch (error) {
      throw error;
    }
  };

  public logout = async (token: string) => {
    try {
      const verify = await JWT.decode(token);

      if (!verify) throw CustomError.badRequest(`Invalid JWT`);

      const findUser = await userModel.findById(verify.id);

      if (!findUser || findUser.email !== verify.email) {
        throw CustomError.badRequest(`Invalid JWT`); // Se que esto sería not 404 found,
        // pero pongo invalid jwt para no dar indicaciones si existe o no el usuario con ese token y evitar atacantes
      }

      return { msg: "Successfull logout" };
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw CustomError.badRequest(`${error}`);
      }
      throw error;
    }
  };
}
