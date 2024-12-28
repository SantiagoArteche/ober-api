import { Router } from "express";
import { ProjectService } from "../services/project.service";
import { ProjectController } from "./controller";

export class ProjectRoutes {
  static routes = () => {
    const router = Router();

    const projectService = new ProjectService();
    const projectController = new ProjectController(projectService);

    router.get("/", projectController.getAllProjects);
    router.get("/:id", projectController.getProjectById);
    router.post("/", projectController.createProject);
    router.put(
      "/:projectId/user/:userId",
      projectController.assignUserToProject
    );
    router.put("/:id", projectController.updateProject);
    router.delete("/:id", projectController.deleteProject);

    return router;
  };
}
