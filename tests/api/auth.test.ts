import supertest from "supertest";
import { testServer } from "./server-test-instance/test.server";
import { userModel } from "../../src/infraestructure/data/mongo-db/models/user.model";
import { MongoDB } from "../../src/infraestructure/data/mongo-db/init";
import { Hash } from "../../src/infraestructure/config/bcrypt";

const api = supertest(testServer.app);

describe("Test on /api/auth", () => {
  beforeAll(async () => {
    await testServer.start();
    await MongoDB.init();
  });

  beforeEach(async () => {
    await userModel.create({
      email: "authuser@example.com",
      password: Hash.hashPassword("user-psw"),
      name: "Santiago",
    });
  });

  afterEach(async () => {
    await userModel.deleteMany();
  });

  afterAll(async () => {
    await testServer.close();
    await MongoDB.disconnect();
  });

  it("POST /api/auth/new-user should create a new user", async () => {
    const mockUser = {
      email: "newauthuser@example.com",
      password: "user-psw",
      name: "Santiago",
    };

    const { ok, body, statusCode } = await api
      .post("/api/auth/new-user")
      .send(mockUser);

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(201);
    expect(body.newUser).toEqual({
      email: mockUser.email,
      name: mockUser.name,
      id: expect.any(String),
    });
  });

  it("POST /api/auth/new-user should throw an error if user already exists", async () => {
    const mockUser = {
      email: "authuser@example.com",
      password: "user-psw",
      name: "Santiago",
    };

    const { ok, body, statusCode } = await api
      .post("/api/auth/new-user")
      .send(mockUser);

    expect(ok).toBeFalsy();
    expect(statusCode).toBe(400);
    expect(body).toEqual({
      error: "User with email authuser@example.com already exists",
      msg: "ERROR",
    });
  });

  it("POST /api/auth/login should successfully login", async () => {
    const mockUser = {
      email: "authuser@example.com",
      password: "user-psw",
    };

    const { ok, body, statusCode } = await api
      .post("/api/auth/login")
      .send(mockUser);

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(body.msg).toEqual("Successful login");
    expect(body.token).toBeDefined();
  });

  it("POST /api/auth/login should fail with incorrect credentials", async () => {
    const mockUser = {
      email: "user@example.com",
      password: "incorrect-psw",
    };

    const { ok, body, statusCode } = await api
      .post("/api/auth/login")
      .send(mockUser);

    expect(ok).toBeFalsy();
    expect(statusCode).toBe(401);
    expect(body).toEqual({
      error: "Wrong credentials",
      msg: "ERROR",
    });
  });

  it("GET /api/auth/logout should successfully logout", async () => {
    const loginUser = {
      email: "authuser@example.com",
      password: "user-psw",
    };

    const loginResponse = await api.post("/api/auth/login").send(loginUser);

    const { statusCode, body } = await api.get(
      `/api/auth/logout/${loginResponse.body.token}`
    );

    expect(statusCode).toBe(200);

    expect(body.msg).toEqual("Successful logout");
  });

  it("GET /api/auth/logout should fail", async () => {
    const { statusCode, body } = await api.get(
      `/api/auth/logout/2f9a1a143243ec99f248e9a48fdf34ae0c0216f1f8f66c89ef4af6f15877fbe4`
    );

    expect(statusCode).toBe(400);

    expect(body.errors).toBeTruthy();
  });

  it("DELETE /api/auth/delete-user/:id should successfully delete a user", async () => {
    const user = await userModel.create({
      email: "deleteuser@example.com",
      password: "delete-psw",
      name: "Delete User",
    });

    const { ok, statusCode, body } = await api
      .delete(`/api/auth/delete-user/${user._id}`)
      .send();

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(body).toEqual({
      msg: `User with id ${user._id} was deleted`,
    });
  });

  it("DELETE /api/auth/delete-user/:id should fail if user not exists", async () => {
    const { ok, statusCode, body } = await api
      .delete(`/api/auth/delete-user/6770006f0490f9d54d748124`)
      .send();

    expect(ok).toBeFalsy();
    expect(statusCode).toBe(404);
    expect(body).toEqual({
      error: "User with id 6770006f0490f9d54d748124 not found",
      msg: "ERROR",
    });
  });
});
