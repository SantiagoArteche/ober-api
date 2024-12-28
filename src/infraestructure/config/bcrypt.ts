import { compareSync, hashSync } from "bcryptjs";
import "dotenv/config";

export class Hash {
  static hashPassword = (password: string) =>
    hashSync(password, +process.env.SALT!);

  static unHashPassword = (password: string, encodedPassword: string) =>
    compareSync(password, encodedPassword);
}
