import supertest from "supertest";
import { testServer } from "./server-test-instance/test.server";
import { MongoDB } from "../../src/infraestructure/data/mongo-db/init";

import { Hash } from "../../src/infraestructure/config/bcrypt";
import { taskModel } from "../../src/infraestructure/data/mongo-db/models/task.model";
import { userModel } from "../../src/infraestructure/data/mongo-db/models/user.model";
import { User } from "../../src/application/services/auth/interfaces";
import { Project } from "../../src/application/services/projects/interfaces";
import { projectModel } from "../../src/infraestructure/data/mongo-db/models/project.model";

const api = supertest(testServer.app);

describe("Test on /api/tasks", () => {
  beforeAll(async () => {
    await testServer.start();
    await MongoDB.init();
  });
  let cookie: string;
  let user: any;
  let project: any;
  beforeEach(async () => {
    user = await userModel.create({
      email: "taskuser@example.com",
      password: Hash.hashPassword("user-psw"),
      name: "Santiago",
    });
    project = await projectModel.create({
      name: "new project",
      users: [user._id],
    });

    const loginResponse = await api.post("/api/auth/login").send({
      email: "taskuser@example.com",
      password: "user-psw",
    });

    cookie = loginResponse.headers["set-cookie"][0];
  });

  afterEach(async () => {
    await taskModel.deleteMany();
    await projectModel.deleteMany();
    await userModel.deleteMany();
  });

  afterAll(async () => {
    await testServer.close();
    await MongoDB.disconnect();
  });

  it("GET /api/tasks should get all tasks", async () => {
    await taskModel.create({
      name: "Task 1",
      description: "First task description",
      status: "completed",
      projectId: project._id,
    });

    const { ok, body, statusCode } = await api
      .get("/api/tasks")
      .set("Cookie", cookie);

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(body.tasks).toHaveLength(1);
    expect(body.tasks[0]).toHaveProperty("name", "Task 1");
  });

  it("GET /api/tasks/:id should return a specific task", async () => {
    const task = await taskModel.create({
      name: "Task 2",
      description: "Second task description",
      status: "completed",
      projectId: project._id,
    });

    const { ok, body, statusCode } = await api
      .get(`/api/tasks/${task._id}`)
      .set("Cookie", cookie);

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(body.task).toHaveProperty("name", "Task 2");
  });

  it("GET /api/tasks/:id should fail if task not exists", async () => {
    const { ok, body, statusCode } = await api
      .get(`/api/tasks/676ff105faab8854b63521e5`)
      .set("Cookie", cookie);

    expect(ok).toBeFalsy();
    expect(statusCode).toBe(404);
    expect(body.msg).toBe("ERROR");
    expect(body.error).toBe("Task with id 676ff105faab8854b63521e5 not found");
  });

  it("POST /api/tasks should create a new task", async () => {
    const newTask = {
      name: "New Task",
      description: "Task description",
      status: "completed",
      projectId: project._id,
      endDate: "2024-11-11",
    };

    const { ok, body, statusCode } = await api
      .post("/api/tasks")
      .set("Cookie", cookie)
      .send(newTask);

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(201);
    expect(body.newTask.name).toBe(newTask.name);
  });

  it("PUT /api/tasks/:id should update a task", async () => {
    const task = await taskModel.create({
      name: "Task to Update",
      description: "Old description",
      status: "pending",
      projectId: project._id,
    });

    const updatedTask = {
      name: "Updated Task",
      description: "Updated description",
      status: "in progress",
    };

    const { ok, body, statusCode } = await api
      .put(`/api/tasks/${task._id}`)
      .set("Cookie", cookie)
      .send(updatedTask);

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(body.updatedTask.name).toBe(updatedTask.name);
    expect(body.updatedTask.description).toBe(updatedTask.description);
    expect(body.updatedTask.status).toBe(updatedTask.status);
  });

  it("PUT /api/tasks/:id should fail if tasks not exists", async () => {
    const updatedTask = {
      name: "Updated Task",
      description: "Updated description",
      status: "in progress",
    };

    const { ok, body, statusCode } = await api
      .put(`/api/tasks/676ff105faab8854b63521e5`)
      .set("Cookie", cookie)
      .send(updatedTask);

    expect(ok).toBeFalsy();
    expect(statusCode).toBe(404);
    expect(body.msg).toBe("ERROR");
    expect(body.error).toBe("Task with id 676ff105faab8854b63521e5 not found");
  });

  it("DELETE /api/tasks/:id should delete a task", async () => {
    const task = await taskModel.create({
      name: "Task to Delete",
      description: "Description",
      status: "completed",
      projectId: project._id,
    });

    const { ok, statusCode, body } = await api
      .delete(`/api/tasks/${task._id}`)
      .set("Cookie", cookie);

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(body).toHaveProperty("msg", `Task with id ${task._id} was deleted`);
  });

  it("DELETE /api/tasks/:id should fail if task not exists", async () => {
    const { ok, statusCode, body } = await api
      .delete(`/api/tasks/676ff105faab8854b63521e5`)
      .set("Cookie", cookie);

    expect(ok).toBeFalsy();
    expect(statusCode).toBe(404);
    expect(body.msg).toBe("ERROR");
    expect(body.error).toBe("Task with id 676ff105faab8854b63521e5 not found");
  });

  it("PUT /api/tasks/:taskId/users/:userId should assign a user to a task", async () => {
    const task = await taskModel.create({
      name: "Task to Assign",
      description: "Description",
      status: "pending",
      projectId: project._id,
    });

    const { ok, body, statusCode } = await api
      .put(`/api/tasks/${task._id}/users/${user._id}`)
      .set("Cookie", cookie);

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(body.task.assignedTo).toContain(user._id.toString());
  });

  it("PUT /api/tasks/:taskId/users/:userId should fail if user not exists", async () => {
    const task = await taskModel.create({
      name: "Task to Assign",
      description: "Description",
      status: "pending",
      projectId: project._id,
    });

    const { ok, body, statusCode } = await api
      .put(`/api/tasks/${task._id}/users/676ff105faab8854b63521e5`)
      .set("Cookie", cookie);

    expect(ok).toBeFalsy();
    expect(statusCode).toBe(404);
    expect(body.msg).toBe("ERROR");
    expect(body.error).toBe("User with id 676ff105faab8854b63521e5 not found");
  });

  it("PUT /api/tasks/:taskId/users/:userId should fail if task not exists", async () => {
    const { ok, body, statusCode } = await api
      .put(`/api/tasks/676ff105faab8854b63521e5/users/${user._id}`)
      .set("Cookie", cookie);

    expect(ok).toBeFalsy();
    expect(statusCode).toBe(404);
    expect(body.msg).toBe("ERROR");
    expect(body.error).toBe("Task with id 676ff105faab8854b63521e5 not found");
  });

  it("PUT /api/tasks/state/:id should change the state of a task", async () => {
    const task = await taskModel.create({
      name: "Task to Change State",
      description: "Description",
      status: "pending",
      projectId: project._id,
    });

    const { ok, body, statusCode } = await api
      .put(`/api/tasks/state/${task._id}`)
      .set("Cookie", cookie)
      .send({ status: "completed" });

    expect(ok).toBeTruthy();
    expect(statusCode).toBe(200);
    expect(body.msg).toBe("Status updated");
    expect(body.updateTaskState.status).toBe("completed");
  });

  it("PUT /api/tasks/state/:id should fail if task not exists", async () => {
    const { ok, body, statusCode } = await api
      .put(`/api/tasks/state/676ff105faab8854b63521e5`)
      .set("Cookie", cookie)
      .send({ status: "completed" });

    expect(ok).toBeFalsy();
    expect(statusCode).toBe(404);
    expect(body.msg).toBe("ERROR");
    expect(body.error).toBe("Task with id 676ff105faab8854b63521e5 not found");
  });
});
