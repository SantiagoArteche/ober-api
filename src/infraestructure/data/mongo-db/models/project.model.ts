import { model, Schema } from "mongoose";

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    users: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    tasks: {
      type: [Schema.Types.ObjectId],
      ref: "Task",
      default: [],
    },
  },
  {
    versionKey: false,
  }
);
// projectSchema.index({ _id: 1 }); // mongodb lo implementa por defecto
projectSchema.index({ name: 1 });
//Estos índices sirven para desarrollo, en producción habría que implementarlo manualmente mediante el administrador de bases de datos
export const projectModel = model("Project", projectSchema);
