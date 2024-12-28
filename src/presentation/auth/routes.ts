import { Router } from "express";
import { AuthController } from "./controller";
import {
  createUserValidations,
  deleteUserValidations,
  loginValidations,
  logoutValidations,
} from "../../domain/validations/auth.validations";

export class AuthRoutes {
  static routes = () => {
    const router = Router();

    const authController = new AuthController();

    router.post("/login", loginValidations, authController.login);
    router.get("/logout/:token", logoutValidations, authController.logout);

    router.post("/new-user", createUserValidations, authController.createUser);
    router.delete(
      "/delete-user/:id",
      deleteUserValidations,
      authController.deleteUser
    );

    return router;
  };
}
