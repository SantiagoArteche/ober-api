import { Router } from "express";
import { AuthController } from "./auth/controller";
import { AuthRoutes } from "./auth/routes";
import { ProjectRoutes } from "./projects/routes";
import { TaskRoutes } from "./tasks/routes";

export class AppRouter {
  static routes = () => {
    const router = Router();

    router.use("/api/auth", AuthRoutes.routes());
    router.use("/api/projects", ProjectRoutes.routes());
    router.use("/api/tasks", TaskRoutes.routes());
    // router.use("/api-docs");

    return router;
  };
}
