import { Router } from "express";
import { TasksController } from "./controller";
import { TaskService } from "../services/task.service";

export class TaskRoutes {
  static routes = () => {
    const router = Router();

    const taskService = new TaskService();
    const taskController = new TasksController(taskService);

    router.get("/", taskController.getAllTasks);
    router.get("/:id", taskController.getTaskById);
    router.post("/", taskController.createTask);
    router.put("/:id", taskController.updateTask);
    router.put("/state/:id", taskController.changeTaskState);
    router.put("/:taskId/user/:userId", taskController.assignTaskToUser);
    router.delete("/:id", taskController.deleteTask);

    return router;
  };
}
