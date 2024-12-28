import { Router } from "express";
import { AuthController } from "./controller";
import { AuthService } from "../services/auth.service";

export class AuthRoutes {
  static routes = () => {
    const router = Router();

    const authService = new AuthService();
    const authController = new AuthController(authService);

    router.post("/login", authController.login);
    router.get("/logout/:token", authController.logout);

    router.post("/new-user", authController.createUser);
    router.delete("/delete-user/:id", authController.deleteUser);

    return router;
  };
}
