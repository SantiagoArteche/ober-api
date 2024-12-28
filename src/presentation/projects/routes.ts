import { Router } from "express";

import { ProjectController } from "./controller";

export class ProjectRoutes {
  static routes = () => {
    const router = Router();

    const projectController = new ProjectController();

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
