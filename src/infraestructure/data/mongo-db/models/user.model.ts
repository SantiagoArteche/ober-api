import { model, Schema } from "mongoose";
import "dotenv/config";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
  },
  {
    versionKey: false,
  }
);
// userSchema.index({ _id: 1 }); // mongodb lo implementa por defecto
// userSchema.index({ email: 1 }); al ser un campo unico implementa el índice automaticamente

userSchema.index({ name: 1 });
//Estos índices sirven para desarrollo, en producción habría que implementarlo manualmente mediante el administrador de bases de datos

export const userModel = model("User", userSchema);
