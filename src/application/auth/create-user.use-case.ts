import { CustomError } from "../../domain/errors/custom-errors";
import { Hash } from "../../infraestructure/config/bcrypt";
import { userModel } from "../../infraestructure/data/mongo-db/models/user.model";

interface User {
  name: string;
  email: string;
  password: string;
}

export const createUser = async (userData: User) => {
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

    return { msg: "User created", newUser };
  } catch (error) {
    throw error;
  }
};
