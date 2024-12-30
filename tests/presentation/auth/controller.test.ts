import { Request, Response } from "express";
import { CustomError } from "../../../src/domain/errors/custom-errors";
import { AuthService } from "../../../src/application/services/auth/service";
import { AuthController } from "../../../src/presentation/auth/controller";

describe("AuthController", () => {
  let authController: AuthController;
  let authService: AuthService;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const customErrorSpy = jest.spyOn(CustomError, "handleErrors");

  beforeEach(() => {
    authService = {
      createUser: jest.fn(),
      deleteUser: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
    } as unknown as AuthService;

    authController = new AuthController(authService);

    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      clearCookie: jest.fn(),
      cookie: jest.fn(),
    };
  });

  describe("createUser", () => {
    it("should create a user when service resolves", async () => {
      const newUser = {
        id: "676ff105faab8854b63521e5",
        name: "Santiago Arteche",
      };
      mockRequest.body = {
        name: "Santiago Arteche",
        email: "santiarteche@example.com",
        password: "password123",
      };

      (authService.createUser as jest.Mock).mockResolvedValue(newUser);

      await authController.createUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(authService.createUser).toHaveBeenCalledWith({
        name: "Santiago Arteche",
        email: "santiarteche@example.com",
        password: "password123",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(newUser);
    });

    it("should handle errors when service rejects", async () => {
      mockRequest.body = {
        name: "Santiago",
        email: "santiarteche@example.com",
        password: "password123",
      };

      const mockError = CustomError.badRequest("Failed to create user");

      (authService.createUser as jest.Mock).mockRejectedValue(mockError);

      await authController.createUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(await customErrorSpy).toHaveBeenCalledTimes(1);
      expect(await customErrorSpy).toHaveBeenCalledWith(
        mockError,
        mockResponse
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.send).toHaveBeenCalledWith({
        msg: "ERROR",
        error: "Failed to create user",
      });
    });
  });

  describe("deleteUser", () => {
    it("should delete a user when service resolves", async () => {
      mockRequest.params = { id: "676ff105faab8854b63521e5" };
      const wasDeleted = { success: true };

      (authService.deleteUser as jest.Mock).mockResolvedValue(wasDeleted);

      await authController.deleteUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(authService.deleteUser).toHaveBeenCalledWith(
        "676ff105faab8854b63521e5"
      );
      expect(mockResponse.json).toHaveBeenCalledWith(wasDeleted);
    });

    it("should handle errors when service rejects", async () => {
      mockRequest.params = { id: "676ff105faab8854b63521e5" };

      const mockError = new CustomError("Failed to delete user", 404);
      (authService.deleteUser as jest.Mock).mockRejectedValue(mockError);

      await authController.deleteUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(await customErrorSpy).toHaveBeenCalledTimes(1);
      expect(await customErrorSpy).toHaveBeenCalledWith(
        mockError,
        mockResponse
      );
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.send).toHaveBeenCalledWith({
        msg: "ERROR",
        error: "Failed to delete user",
      });
    });
  });

  describe("login", () => {
    it("should login a user and set a cookie when service resolves", async () => {
      const loginResponse = { token: "someAuthToken" };
      mockRequest.body = { email: "user@example.com", password: "password123" };

      (authService.login as jest.Mock).mockResolvedValue(loginResponse);

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(authService.login).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "password123",
      });
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        "auth_token",
        "someAuthToken",
        {
          httpOnly: true,
          secure: false,
          sameSite: "strict",
          maxAge: 2 * 60 * 60 * 1000,
        }
      );
      expect(mockResponse.json).toHaveBeenCalledWith(loginResponse);
    });

    it("should handle errors when service rejects", async () => {
      mockRequest.body = {
        email: "santiarteche@example.com",
        password: "password123",
      };

      const mockError = new CustomError("Wrong credentials", 401);

      (authService.login as jest.Mock).mockRejectedValue(mockError);

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(await customErrorSpy).toHaveBeenCalledTimes(1);
      expect(await customErrorSpy).toHaveBeenCalledWith(
        mockError,
        mockResponse
      );
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.send).toHaveBeenCalledWith({
        msg: "ERROR",
        error: "Wrong credentials",
      });
    });
  });

  describe("logout", () => {
    it("should logout a user and clear the cookie when service resolves", async () => {
      const logoutResponse = { success: true };
      mockRequest.params = { token: "someAuthToken" };

      (authService.logout as jest.Mock).mockResolvedValue(logoutResponse);

      await authController.logout(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(authService.logout).toHaveBeenCalledWith("someAuthToken");
      expect(mockResponse.clearCookie).toHaveBeenCalledWith("auth_token");
      expect(mockResponse.json).toHaveBeenCalledWith(logoutResponse);
    });

    it("should handle errors when service rejects", async () => {
      mockRequest.params = { token: "wrong token" };
      const mockError = new CustomError("Logout failed", 400);
      (authService.logout as jest.Mock).mockRejectedValue(mockError);

      await authController.logout(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(await customErrorSpy).toHaveBeenCalledTimes(1);
      expect(await customErrorSpy).toHaveBeenCalledWith(
        mockError,
        mockResponse
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.send).toHaveBeenCalledWith({
        msg: "ERROR",
        error: "Logout failed",
      });
    });
  });
});
