import { Router } from "express";
import { AuthController } from "./controller";

export class AuthRoutes {
  static routes = () => {
    const router = Router();

    const authController = new AuthController();

    router.post("/login", authController.login);
    router.get("/logout/:token", authController.logout);

    router.post("/new-user", authController.createUser);
    router.delete("/delete-user/:id", authController.deleteUser);

    return router;
  };
}
