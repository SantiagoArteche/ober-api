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

export const projectModel = model("Project", projectSchema);
