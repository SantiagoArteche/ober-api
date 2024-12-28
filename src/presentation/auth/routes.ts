import { Router } from "express";
import { AuthController } from "./controller";
import {
  createUserValidations,
  loginValidations,
  logoutValidations,
} from "../../domain/validations/auth.validations";
import { AuthService } from "../../application/services/auth/service";
import { idValidation } from "../../domain/validations/shared.validations";

export class AuthRoutes {
  static routes = () => {
    const router = Router();

    const authService = new AuthService();

    const authController = new AuthController(authService);

    router.post("/login", loginValidations, authController.login);
    router.get("/logout/:token", logoutValidations, authController.logout);

    router.post("/new-user", createUserValidations, authController.createUser);

    router.delete("/delete-user/:id", idValidation, authController.deleteUser);

    return router;
  };
}
