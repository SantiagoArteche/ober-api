import { Router } from "express";

import { ProjectController } from "./controller";
import {
  createProjectValidation,
  updateProjectValidation,
  assignUserToProjectValidation,
} from "../../domain/validations/project.validations";
import { ProjectService } from "../../application/services/projects/service";
import { AuthMiddleware } from "../../domain/middlewares/auth.middleware";
import { idValidation } from "../../domain/validations/shared.validations";

export class ProjectRoutes {
  static routes = () => {
    const router = Router();

    const projectService = new ProjectService();
    const projectController = new ProjectController(projectService);

    router.use(AuthMiddleware.validateJWT as any);

    router.get("/", projectController.getAllProjects);
    router.get("/:id", idValidation, projectController.getProjectById);
    router.post("/", createProjectValidation, projectController.createProject);

    router.put(
      "/:projectId/users/:userId",
      assignUserToProjectValidation,
      projectController.assignUserToProject
    );

    router.put(
      "/:id",
      updateProjectValidation,
      projectController.updateProject
    );

    router.delete("/:id", idValidation, projectController.deleteProject);

    return router;
  };
}
