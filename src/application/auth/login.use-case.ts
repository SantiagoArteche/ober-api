import { CustomError } from "../../domain/errors/custom-errors";
import { Hash } from "../../infraestructure/config/bcrypt";
import { JWT } from "../../infraestructure/config/jwt";
import { userModel } from "../../infraestructure/data/mongo-db/models/user.model";

interface Credentials {
  email: string;
  password: string;
}

export const login = async (credentials: Credentials) => {
  try {
    const findUserByEmail = await userModel.findOne({
      email: credentials.email,
    });

    if (!findUserByEmail) {
      throw CustomError.badRequest(`Wrong credentials`); // Se que iría 404 not found,
      // pero utilizo esto para no dar pistas si existe o no el usuario con el email (en caso de atacantes)
    }

    if (!Hash.unHashPassword(credentials.password, findUserByEmail.password)) {
      throw CustomError.badRequest(`Wrong credentials`);
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
