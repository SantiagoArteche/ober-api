import { CustomError } from "../../domain/errors/custom-errors";
import { userModel } from "../../infraestructure/data/mongo-db/models/user.model";

export const deleteUser = async (id: string) => {
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
