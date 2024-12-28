import { JsonWebTokenError } from "jsonwebtoken";
import { CustomError } from "../../domain/errors/custom-errors";
import { JWT } from "../../infraestructure/config/jwt";
import { userModel } from "../../infraestructure/data/mongo-db/models/user.model";

export const logout = async (token: string) => {
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
