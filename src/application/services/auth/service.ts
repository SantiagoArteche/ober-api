import { JsonWebTokenError } from "jsonwebtoken";
import { CustomError } from "../../../domain/errors/custom-errors";
import { Hash } from "../../../infraestructure/config/bcrypt";
import { JWT } from "../../../infraestructure/config/jwt";
import { userModel } from "../../../infraestructure/data/mongo-db/models/user.model";
import { User, Credentials } from "./interfaces";
import { Logger } from "../../../infraestructure/config/logger";

export class AuthService {
  constructor(private readonly logger: Logger = new Logger()) {}

  // public getUsers = async () => {
  //   try {
  //     const users = await userModel.find().select("_id name email");

  //     return users;
  //   } catch (error) {
  //     throw error;
  //   }
  // };

  public createUser = async (userData: User) => {
    try {
      const findUser = await userModel.findOne({ email: userData.email });

      if (findUser) {
        this.logger.warning(
          "User creation failed: email already exists" +
            JSON.stringify({
              email: userData.email,
            })
        );
        throw CustomError.badRequest(
          `User with email ${userData.email} already exists`
        );
      }

      const newUser = await userModel.create({
        ...userData,
        password: Hash.hashPassword(userData.password),
      });

      this.logger.info(
        "User created successfully" +
          JSON.stringify({
            id: newUser._id,
            email: newUser.email,
          })
      );

      return {
        msg: "User created",
        newUser: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
        },
      };
    } catch (error) {
      this.logger.error("Error creating user " + error);
      throw error;
    }
  };

  public deleteUser = async (id: string) => {
    try {
      const findUser = await userModel.findById(id);

      if (!findUser) {
        this.logger.warning("User deletion failed: user not found " + id);
        throw CustomError.notFound(`User with id ${id} not found`);
      }

      await userModel.findByIdAndDelete(id);

      this.logger.info("User deleted successfully " + id);

      return { msg: `User with id ${id} was deleted` };
    } catch (error) {
      this.logger.error("Error deleting user " + JSON.stringify({ id, error }));
      throw error;
    }
  };

  public login = async (credentials: Credentials) => {
    try {
      const findUserByEmail = await userModel.findOne({
        email: credentials.email,
      });

      if (!findUserByEmail) {
        this.logger.warning(
          "Login failed: wrong credentials " +
            JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            })
        );
        throw CustomError.unauthorized(`Wrong credentials`);
      }

      if (
        !Hash.unHashPassword(credentials.password, findUserByEmail.password)
      ) {
        this.logger.warning(
          "Login failed: wrong credentials " +
            JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            })
        );
        throw CustomError.unauthorized(`Wrong credentials`);
      }

      const token = await JWT.generate(
        {
          id: findUserByEmail._id.toString(),
          email: credentials.email,
        },
        "2h"
      );

      if (!token) {
        this.logger.error(`Login failed: JWT generation error`);
        throw CustomError.internalServerError(`JWT error`);
      }

      this.logger.info(`User logged in successfully ${credentials.email}`);

      return { msg: "Successful login", token };
    } catch (error) {
      this.logger.error(
        "Error during login " +
          JSON.stringify({
            email: credentials.email,
            error,
          })
      );
      throw error;
    }
  };

  public logout = async (token: string) => {
    try {
      const verify = await JWT.decode(token);

      if (!verify) {
        this.logger.warning("Logout failed: invalid JWT " + token);
        throw CustomError.badRequest(`Invalid JWT`);
      }

      const findUser = await userModel.findById(verify.id);

      if (!findUser || findUser.email !== verify.email) {
        this.logger.warning("Logout failed: invalid JWT " + token);
        throw CustomError.badRequest(`Invalid JWT`);
      }

      this.logger.info(
        `User logged out successfully ${JSON.stringify({
          id: verify.id,
          email: verify.email,
        })}}`
      );

      return { msg: "Successful logout" };
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        this.logger.error(
          `JWT decoding error during logout ${JSON.stringify({
            token,
            error,
          })}}`
        );
        throw CustomError.badRequest(`${error}`);
      }

      this.logger.error(
        `Error during logout ${JSON.stringify({ token, error })}}`
      );
      throw error;
    }
  };
}
