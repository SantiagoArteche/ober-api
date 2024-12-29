import { Router } from "express";
import { AuthRoutes } from "./auth/routes";
import { ProjectRoutes } from "./projects/routes";
import { TaskRoutes } from "./tasks/routes";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { swaggerOptions } from "../infraestructure/config/swagger";

export class AppRouter {
  static routes = () => {
    const router = Router();

    router.use("/api/auth", AuthRoutes.routes());
    router.use("/api/projects", ProjectRoutes.routes());
    router.use("/api/tasks", TaskRoutes.routes());
    router.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerJSDoc(swaggerOptions))
    );

    return router;
  };
}
