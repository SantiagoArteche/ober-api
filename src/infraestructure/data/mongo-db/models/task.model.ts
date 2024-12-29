import { model, Schema } from "mongoose";

const taskSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "Empty description",
    },
    assignedTo: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "The id of the project is required"],
    },
    status: {
      type: String,
      enum: ["pending", "in progress", "completed"],
      default: "pending",
    },
    startDate: {
      type: Date,
      default: new Date(),
    },
    endDate: {
      type: Date,
      required: [true, "endDate is required"],
      default: new Date(),
    },
  },
  {
    versionKey: false,
  }
);

export const taskModel = model("Task", taskSchema);
