import supertest from "supertest";
import { testServer } from "./server-test-instance/test.server";
import { MongoDB } from "../../src/infraestructure/data/mongo-db/init";

import { Hash } from "../../src/infraestructure/config/bcrypt";
import { projectModel } from "../../src/infraestructure/data/mongo-db/models/project.model";
import { userModel } from "../../src/infraestructure/data/mongo-db/models/user.model";

const api = supertest(testServer.app);

describe("Test on /api/projects", () => {
  beforeAll(async () => {
    await testServer.start();
    await MongoDB.init();
  });
  let cookie: string;
  beforeEach(async () => {
    const user = await userModel.create({
      email: "projectuser@example.com",
      password: Hash.hashPassword("user-psw"),
      name: "Santiago",
    });

    await projectModel.create({
      name: "Project 1",
      users: [user.id],
    });

    const loginResponse = await api.post("/api/auth/login").send({
      email: "projectuser@example.com",
      password: "user-psw",
    });

    cookie = loginResponse.headers["set-cookie"][0];
  });

  afterEach(async () => {
    await projectModel.deleteMany();
    await userModel.deleteMany();
  });

  afterAll(async () => {
    await testServer.close();
    await MongoDB.disconnect();
  });

  it("GET /api/projects should get all projects", async () => {
    const { ok, body, statusCode } = await api
      .get("/api/projects")
      .set("Cookie", cookie);

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(body.projects).toHaveLength(1);
    expect(body.projects[0]).toHaveProperty("name", "Project 1");
  });

  it("GET /api/projects/:id should return a specific project", async () => {
    const project = await projectModel.create({
      name: "Project 2",
      users: [],
    });

    const { ok, body, statusCode } = await api
      .get(`/api/projects/${project._id}`)
      .set("Cookie", cookie);

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(body.project).toHaveProperty("name", "Project 2");
    expect(body.project._id).toBe(project.id);
  });

  it("POST /api/projects should create a new project", async () => {
    const user = await userModel.create({
      email: "newprojectuser@example.com",
      password: Hash.hashPassword("newuser-psw"),
      name: "New User",
    });

    const newProject = {
      name: "New Project",
      users: [user.id],
    };

    const { ok, body, statusCode } = await api
      .post("/api/projects")
      .set("Cookie", cookie)
      .send(newProject);

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(201);
    expect(body.newProject.name).toBe(newProject.name);
    expect(body.msg).toBe("Project created");
    expect(body.newProject.users).toContain(user.id);
  });

  it("PUT /api/projects/:id should update a project", async () => {
    const project = await projectModel.create({
      name: "Project to Update",
      users: [],
    });

    const updatedProject = {
      name: "Updated Project",
      users: [],
    };

    const { ok, body, statusCode } = await api
      .put(`/api/projects/${project.id}`)
      .set("Cookie", cookie)
      .send(updatedProject);

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(body.msg).toBe("Project updated");
    expect(body.updatedProject.name).toBe(updatedProject.name);
  });

  it("PUT /api/projects/:id should fail if project not exists", async () => {
    const updatedProject = {
      name: "Updated Project",
      users: [],
    };

    const { ok, body, statusCode } = await api
      .put(`/api/projects/676ff105faab8854b63521e5`)
      .set("Cookie", cookie)
      .send(updatedProject);

    expect(ok).toBeFalsy();
    expect(statusCode).toBe(404);
    expect(body.msg).toBe("ERROR");
    expect(body.error).toBe(
      "Project with id 676ff105faab8854b63521e5 not found"
    );
  });

  it("PUT /api/projects/:projectId/users/:userId should assign a user to a project", async () => {
    const project = await projectModel.create({
      name: "Project to Assign User",
      users: [],
    });

    const user = await userModel.create({
        email: "userb@example.com",
        password: Hash.hashPassword("user-psw"),
        name: "User to Assign",
      });

    const { ok, body, statusCode } = await api
      .put(`/api/projects/${project.id}/users/${user.id}`)
      .set("Cookie", cookie)
      .send();

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(body.projectUpdated.users).toContain(user.id);
  });

  it("PUT /api/projects/:projectId/users/:userId should fail if user not exists", async () => {
    const project = await projectModel.create({
      name: "Project to Assign User",
      users: [],
    });

    const { ok, body, statusCode } = await api
      .put(`/api/projects/${project.id}/users/676ff105faab8854b63521e5`)
      .set("Cookie", cookie)
      .send();

    expect(ok).toBeFalsy();
    expect(statusCode).toBe(404);
    expect(body.error).toContain(
      `User with id 676ff105faab8854b63521e5 not found`
    );
  });

  it("PUT /api/projects/:projectId/users/:userId should fail if project not exists", async () => {
    const user = await userModel.create({
      email: "userb@example.com",
      password: Hash.hashPassword("user-psw"),
      name: "User to Assign",
    });

    const { ok, body, statusCode } = await api
      .put(`/api/projects/676ff105faab8854b63521e5/users/${user._id}`)
      .set("Cookie", cookie)
      .send();

    expect(ok).toBeFalsy();
    expect(statusCode).toBe(404);
    expect(body.error).toContain(
      `Project with id 676ff105faab8854b63521e5 not found`
    );
  });

  it("DELETE /api/projects/:id should delete a project", async () => {
    const project = await projectModel.create({
      name: "Project to Delete",
      users: [],
    });

    const { ok, statusCode, body } = await api
      .delete(`/api/projects/${project.id}`)
      .set("Cookie", cookie)
      .send();

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(body.msg).toBe(`Project with id ${project.id} was deleted`);
  });

  it("DELETE /api/projects/:id should fail if project does not exist", async () => {
    const { ok, statusCode, body } = await api
      .delete("/api/projects/6770006f0490f9d54d748121")
      .set("Cookie", cookie)
      .send();

    expect(ok).toBeFalsy();
    expect(statusCode).toBe(404);
    expect(body).toEqual({
      error: "Project with id 6770006f0490f9d54d748121 not found",
      msg: "ERROR",
    });
  });
});
