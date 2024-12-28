import { Router } from "express";
import { TasksController } from "./controller";
import { TaskService } from "../../application/services/tasks/service";
import { idValidation } from "../../domain/validations/shared.validations";
import { changeTaskStateValidation } from "../../domain/validations/task.validation";
import {
  assignTaskToUserValidation,
  createTaskValidation,
  updateTaskValidation,
} from "../../domain/validations/task.validation";
import { AuthMiddleware } from "../../domain/middlewares/auth.middleware";

export class TaskRoutes {
  static routes = () => {
    const router = Router();

    const taskService = new TaskService();
    const taskController = new TasksController(taskService);

    router.use(AuthMiddleware.validateJWT as any);

    router.get("/", taskController.getAllTasks);
    router.get("/:id", idValidation, taskController.getTaskById);
    router.post("/", createTaskValidation, taskController.createTask);
    router.put("/:id", updateTaskValidation, taskController.updateTask);
    router.put(
      "/state/:id",
      changeTaskStateValidation,
      taskController.changeTaskState
    );
    router.put(
      "/:taskId/users/:userId",
      assignTaskToUserValidation,
      taskController.assignTaskToUser
    );
    router.delete("/:id", idValidation, taskController.deleteTask);

    return router;
  };
}
