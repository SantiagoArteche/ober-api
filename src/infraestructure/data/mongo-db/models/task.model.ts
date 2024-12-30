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
// taskSchema.index({ _id: 1 }); // mongodb lo implementa por defecto

taskSchema.index({ assignedTo: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ endDate: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ name: 1 });
taskSchema.index({ projectId: 1 });

//Estos índices sirven para desarrollo, en producción habría que implementarlo manualmente mediante el administrador de bases de datos
export const taskModel = model("Task", taskSchema);
