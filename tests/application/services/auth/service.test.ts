import { AuthService } from "../../../../src/application/services/auth/service";
import { Hash } from "../../../../src/infraestructure/config/bcrypt";
import { JWT } from "../../../../src/infraestructure/config/jwt";
import { userModel } from "../../../../src/infraestructure/data/mongo-db/models/user.model";

jest.mock(
  "../../../../src/infraestructure/data/mongo-db/models/user.model",
  () => ({
    userModel: {
      findOne: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findByIdAndDelete: jest.fn(),
    },
  })
);

jest.mock("../../../../src/infraestructure/config/bcrypt", () => ({
  Hash: {
    hashPassword: jest.fn(),
    unHashPassword: jest.fn(),
  },
}));

jest.mock("../../../../src/infraestructure/config/jwt", () => ({
  JWT: {
    generate: jest.fn(),
    decode: jest.fn(),
  },
}));

const authService = new AuthService();

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    it("should create a user successfully", async () => {
      const userData = {
        name: "Santiago Arteche",
        email: "santiarteche@example.com",
        password: "password123",
      };

      (userModel.findOne as jest.Mock).mockResolvedValue(null); 
      (userModel.create as jest.Mock).mockResolvedValue({
        _id: "123",
        name: userData.name,
        email: userData.email,
      });
      (Hash.hashPassword as jest.Mock).mockReturnValue("hashedPassword");

      const result = await authService.createUser(userData);

      expect(userModel.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(userModel.create).toHaveBeenCalledWith({
        ...userData,
        password: "hashedPassword",
      });

      expect(result).toEqual({
        msg: "User created",
        newUser: {
          id: "123",
          name: userData.name,
          email: userData.email,
        },
      });
    });

    it("should throw an error if email already exists", async () => {
      const userData = {
        name: "John Doe",
        email: "johndoe@example.com",
        password: "password123",
      };

      (userModel.findOne as jest.Mock).mockResolvedValue(userData);

      await expect(authService.createUser(userData)).rejects.toThrow(
        `User with email ${userData.email} already exists`
      );
    });
  });

  describe("login", () => {
    it("should login successfully and return a token", async () => {
      const credentials = {
        email: "johndoe@example.com",
        password: "password123",
      };

      const mockUser = {
        _id: "123",
        email: credentials.email,
        password: "hashedPassword",
      };

      (userModel.findOne as jest.Mock).mockResolvedValue(mockUser);
      (Hash.unHashPassword as jest.Mock).mockReturnValue(true); 
      (JWT.generate as jest.Mock).mockResolvedValue("jwtToken");

      const result = await authService.login(credentials);

      expect(userModel.findOne).toHaveBeenCalledWith({
        email: credentials.email,
      });
      expect(Hash.unHashPassword).toHaveBeenCalledWith(
        credentials.password,
        mockUser.password
      );
      expect(JWT.generate).toHaveBeenCalledWith(
        { id: mockUser._id.toString(), email: credentials.email },
        "2h"
      );

      expect(result).toEqual({
        msg: "Successful login",
        token: "jwtToken",
      });
    });

    it("should throw an error for wrong credentials when password does not match", async () => {
      const credentials = {
        email: "johndoe@example.com",
        password: "wrongPassword",
      };

      const mockUser = {
        _id: "123",
        email: credentials.email,
        password: "hashedPassword",
      };

      (userModel.findOne as jest.Mock).mockResolvedValue(mockUser);
      (Hash.unHashPassword as jest.Mock).mockReturnValue(false); 

      await expect(authService.login(credentials)).rejects.toThrow(
        `Wrong credentials`
      );
    });
  });

  describe("logout", () => {
    it("should logout successfully", async () => {
      const token = "validJwtToken";
      const mockDecoded = { id: "123", email: "johndoe@example.com" };

      (JWT.decode as jest.Mock).mockReturnValue(mockDecoded);
      (userModel.findById as jest.Mock).mockResolvedValue({
        _id: "123",
        email: "johndoe@example.com",
      });

      const result = await authService.logout(token);

      expect(JWT.decode).toHaveBeenCalledWith(token);
      expect(userModel.findById).toHaveBeenCalledWith(mockDecoded.id);

      expect(result).toEqual({ msg: "Successful logout" });
    });

    it("should throw an error for invalid JWT", async () => {
      const token = "invalidJwtToken";

      (JWT.decode as jest.Mock).mockReturnValue(null);

      await expect(authService.logout(token)).rejects.toThrow(`Invalid JWT`);
    });
  });

  describe("logout", () => {
    it("should logout successfully", async () => {
      const token = "validJwtToken";
      const mockDecoded = { id: "123", email: "johndoe@example.com" };
      const mockUser = { _id: "123", email: "johndoe@example.com" };

      (JWT.decode as jest.Mock).mockResolvedValue(mockDecoded);
      (userModel.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.logout(token);

      expect(JWT.decode).toHaveBeenCalledWith(token);
      expect(userModel.findById).toHaveBeenCalledWith(mockDecoded.id);

      expect(result).toEqual({ msg: "Successful logout" });
    });

    it("should throw an error for invalid JWT", async () => {
      const token = "invalidJwtToken";

      (JWT.decode as jest.Mock).mockResolvedValue(null);

      await expect(authService.logout(token)).rejects.toThrow(`Invalid JWT`);
    });
  });
});
