import { Router } from "express";

import { ProjectController } from "./controller";
import {
  idValidation,
  createProjectValidation,
  updateProjectValidation,
  assignUserToProjectValidation,
} from "../../domain/validations/project.validations";
import { ProjectService } from "../../application/services/projects/service";

export class ProjectRoutes {
  static routes = () => {
    const router = Router();

    const projectService = new ProjectService();
    const projectController = new ProjectController(projectService);

    router.get("/", projectController.getAllProjects);
    router.get("/:id", idValidation, projectController.getProjectById);
    router.post("/", createProjectValidation, projectController.createProject);

    router.put(
      "/:projectId/user/:userId",
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
