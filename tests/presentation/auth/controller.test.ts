import { Request, Response } from "express";
import { CustomError } from "../../../src/domain/errors/custom-errors";
import { AuthService } from "../../../src/application/services/auth/service";
import { AuthController } from "../../../src/presentation/auth/controller";

describe("AuthController", () => {
  let authController: AuthController;
  let authService: AuthService;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    authService = {
      getUsers: jest.fn(),
      createUser: jest.fn(),
      deleteUser: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
    } as unknown as AuthService;

    authController = new AuthController(authService);

    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };
  });

  describe("getUsers", () => {
    it("should return users when service resolves", async () => {
      const users = [{ id: "1", name: "John Doe" }];
      (authService.getUsers as jest.Mock).mockResolvedValue(users);

      await authController.getUsers(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(authService.getUsers).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(users);
    });

    it("should handle errors when service rejects", async () => {
      const error = new CustomError("Some error", 500);
      (authService.getUsers as jest.Mock).mockRejectedValue(error);

      jest.spyOn(CustomError, "handleErrors").mockImplementation(jest.fn());

      await authController.getUsers(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(CustomError.handleErrors).toHaveBeenCalledWith(
        error,
        mockResponse
      );
    });
  });

  describe("createUser", () => {
    it("should create a user when service resolves", async () => {
      const newUser = { id: "1", name: "Jane Doe" };
      mockRequest.body = {
        name: "Jane",
        email: "jane@example.com",
        password: "password123",
      };

      (authService.createUser as jest.Mock).mockResolvedValue(newUser);

      await authController.createUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(authService.createUser).toHaveBeenCalledWith({
        name: "Jane",
        email: "jane@example.com",
        password: "password123",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(newUser);
    });

    it("should handle errors when service rejects", async () => {
      const error = new CustomError("Failed to create user", 400);
      (authService.createUser as jest.Mock).mockRejectedValue(error);

      jest.spyOn(CustomError, "handleErrors").mockImplementation(jest.fn());

      await authController.createUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(CustomError.handleErrors).toHaveBeenCalledWith(
        error,
        mockResponse
      );
    });
  });

  describe("deleteUser", () => {
    it("should delete a user when service resolves", async () => {
      mockRequest.params = { id: "1" };
      const wasDeleted = { success: true };

      (authService.deleteUser as jest.Mock).mockResolvedValue(wasDeleted);

      await authController.deleteUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(authService.deleteUser).toHaveBeenCalledWith("1");
      expect(mockResponse.json).toHaveBeenCalledWith(wasDeleted);
    });

    it("should handle errors when service rejects", async () => {
      const error = new CustomError("Failed to delete user", 404);
      (authService.deleteUser as jest.Mock).mockRejectedValue(error);

      jest.spyOn(CustomError, "handleErrors").mockImplementation(jest.fn());

      await authController.deleteUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(CustomError.handleErrors).toHaveBeenCalledWith(
        error,
        mockResponse
      );
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
      const error = new CustomError("Login failed", 401);
      (authService.login as jest.Mock).mockRejectedValue(error);

      jest.spyOn(CustomError, "handleErrors").mockImplementation(jest.fn());

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(CustomError.handleErrors).toHaveBeenCalledWith(
        error,
        mockResponse
      );
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
      const error = new CustomError("Logout failed", 400);
      (authService.logout as jest.Mock).mockRejectedValue(error);

      jest.spyOn(CustomError, "handleErrors").mockImplementation(jest.fn());

      await authController.logout(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(CustomError.handleErrors).toHaveBeenCalledWith(
        error,
        mockResponse
      );
    });
  });
});
