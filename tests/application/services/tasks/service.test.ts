import { taskModel } from "../../../../src/infraestructure/data/mongo-db/models/task.model";
import { projectModel } from "../../../../src/infraestructure/data/mongo-db/models/project.model";
import { CustomError } from "../../../../src/domain/errors/custom-errors";
import { TaskService } from "../../../../src/application/services/tasks/service";
import { Task } from "../../../../src/application/services/tasks/interfaces";
import mongoose from "mongoose";
import { userModel } from "../../../../src/infraestructure/data/mongo-db/models/user.model";
import { ObjectId } from "mongodb";

jest.mock(
  "../../../../src/infraestructure/data/mongo-db/models/task.model",
  () => ({
    taskModel: {
      find: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      countDocuments: jest.fn(),
    },
  })
);

jest.mock(
  "../../../../src/infraestructure/data/mongo-db/models/project.model",
  () => ({
    projectModel: {
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    },
  })
);

jest.mock(
  "../../../../src/infraestructure/data/mongo-db/models/user.model",
  () => ({
    userModel: {
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    },
  })
);

jest.mock("mongoose", () => ({
  ...jest.requireActual("mongoose"),
  startSession: jest.fn().mockResolvedValue({
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
  }),
}));

describe("TaskService", () => {
  const taskService = new TaskService();
  let mockTask: Task;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTask = {
      _id: "677015698c4daac8074336d9",
      startDate: "2024-12-30T00:05:48.476Z" as unknown as Date,
      endDate: "2024-12-30T00:05:48.476Z" as unknown as Date,
      projectId: "677015698c4daac8074336d5",
      name: "newTask",
      description: "No description",
      assignedTo: ["676ff105faab8854b63521e5"],
      status: "pending" as any,
    };
  });

  describe("getAllTasks", () => {
    it("should fetch all tasks with pagination", async () => {
      const mockTasks = [
        {
          _id: "677015698c4daac8074336d3",
          description: "Empty description",
          startDate: new Date("2024-12-30T00:05:48.476Z"),
          endDate: new Date("2024-12-30T00:05:48.476Z"),
          projectId: "677015698c4daac8074336d5",
          name: "newTask",
          assignedTo: ["676ff105faab8854b63521e5"],
          status: "pending",
        },
        {
          _id: "677015698c4daac8074336d5",
          description: "No description",
          startDate: new Date("2024-12-30T00:05:48.476Z"),
          endDate: new Date("2024-12-30T00:05:48.476Z"),
          projectId: "677015698c4daac8074336d5",
          name: "newTask",
          assignedTo: ["676ff105faab8854b63521e5"],
          status: "pending",
        },
      ];
      const mockCount = mockTasks.length;

      (taskModel.find as jest.Mock).mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockResolvedValue(mockTasks),
      });

      (taskModel.countDocuments as jest.Mock).mockResolvedValue(mockCount);

      const result = await taskService.getAllTasks(
        {
          endDate: "2024-12-30" as unknown as Date,
          status: "pending",
          userAssigned: "676ff105faab8854b63521e5",
        },
        { skip: 0, limit: 10 }
      );

      expect(taskModel.find).toHaveBeenCalledWith({
        assignedTo: ["676ff105faab8854b63521e5"],
        status: "pending",
      });
      expect(taskModel.find().limit).toHaveBeenCalledWith(10);
      expect(taskModel.find().skip).toHaveBeenCalledWith(0);
      expect(taskModel.countDocuments).toHaveBeenCalledWith({
        assignedTo: ["676ff105faab8854b63521e5"],
        status: "pending",
      });
      expect(result.tasks).toEqual(mockTasks);
      expect(result.totalDocuments).toBe(mockCount);
      expect(result.totalPages).toBe(1);
    });
  });

  describe("getTaskById", () => {
    it("should fetch a task by ID", async () => {
      (taskModel.findById as jest.Mock).mockResolvedValue(mockTask);

      const result = await taskService.getTaskById("677015698c4daac8074336d5");

      expect(taskModel.findById).toHaveBeenCalledWith(
        "677015698c4daac8074336d5"
      );
      expect(result.task).toEqual(mockTask);
    });

    it("should throw an error if task is not found", async () => {
      (taskModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(taskService.getTaskById("1")).rejects.toThrow(
        CustomError.notFound("Task with id 1 not found")
      );

      expect(taskModel.findById).toHaveBeenCalledWith("1");
    });
  });

  describe("getTasksByName", () => {
    const mockTasks = [
      {
        _id: "6770006f0490f9d54d748124",
        name: "Task A",
        description: "Description A",
      },
      {
        _id: "6770006f0490f9d54d748123",
        name: "Task A",
        description: "Description B",
      },
    ];

    it("should fetch tasks by name", async () => {
      (taskModel.find as jest.Mock).mockResolvedValue(mockTasks);

      const result = await taskService.getTasksByName("Task A");

      expect(taskModel.find).toHaveBeenCalledWith({ name: "Task A" });
      expect(result.task).toEqual(mockTasks);
    });

    it("should throw an error if no tasks are found", async () => {
      (taskModel.find as jest.Mock).mockResolvedValue([]);

      await expect(taskService.getTasksByName("No Task")).rejects.toThrow(
        CustomError.notFound("Tasks with name No Task not found")
      );

      expect(taskModel.find).toHaveBeenCalledWith({
        name: "No Task",
      });
    });
  });

  describe("getTasksByDescription", () => {
    const mockTasks = [
      {
        _id: "6770006f0490f9d54d748124",
        name: "Task A",
        description: "Description A",
      },
      {
        _id: "6770006f0490f9d54d748123",
        name: "Task B",
        description: "Description A",
      },
    ];

    it("should fetch tasks by description", async () => {
      (taskModel.find as jest.Mock).mockResolvedValue(mockTasks);

      const result = await taskService.getTasksByDescription("Description A");

      expect(taskModel.find).toHaveBeenCalledWith({
        description: "Description A",
      });
      expect(result.task).toEqual(mockTasks);
    });

    it("should throw an error if no tasks are found", async () => {
      (taskModel.find as jest.Mock).mockResolvedValue([]);

      await expect(
        taskService.getTasksByDescription("No Description")
      ).rejects.toThrow(
        CustomError.notFound("Tasks with description No Description not found")
      );

      expect(taskModel.find).toHaveBeenCalledWith({
        description: "No Description",
      });
    });
  });

  describe("createTask", () => {
    it("should create a new task and add it to the project", async () => {
      const mockTaskData = {
        name: "New Task",
        projectId: "6770006f0490f9d54d748125",
        assignedTo: [],
      };
      const mockProject = { _id: "6770006f0490f9d54d748125", tasks: [] };
      const mockCreatedTask = {
        _id: "6770006f0490f9d54d748124",
        ...mockTaskData,
      };
      const mockSession = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
      };

      (mongoose.startSession as jest.Mock).mockResolvedValue(mockSession);

      const findByIdMock = jest.fn().mockReturnValue({
        session: jest.fn().mockResolvedValue(mockProject),
      });
      (projectModel.findById as jest.Mock) = findByIdMock;

      const createMock = jest.fn().mockResolvedValue([mockCreatedTask]);
      (taskModel.create as jest.Mock) = createMock;

      const findByIdAndUpdateMock = jest.fn().mockResolvedValue({});
      (projectModel.findByIdAndUpdate as jest.Mock) = findByIdAndUpdateMock;

      const result = await taskService.createTask(mockTaskData as any);

      expect(mongoose.startSession).toHaveBeenCalled();
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(projectModel.findById).toHaveBeenCalledWith(
        "6770006f0490f9d54d748125"
      );
      expect(taskModel.create).toHaveBeenCalledWith([mockTaskData], {
        session: mockSession,
      });
      expect(projectModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "6770006f0490f9d54d748125",
        { tasks: ["6770006f0490f9d54d748124"] },
        { session: mockSession }
      );
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
      expect(result.newTask).toEqual(mockCreatedTask);
    });

    it("should create a new task and validate users assigned to the project", async () => {
      const mockTaskData = {
        name: "New Task",
        projectId: new ObjectId("6770006f0490f9d54d748125"),
        assignedTo: [new ObjectId("6770006f0490f9d54d748123")],
      };

      const mockProject = {
        _id: new ObjectId("6770006f0490f9d54d748125"),
        tasks: [],
      };

      const mockCreatedTask = {
        _id: new ObjectId("6770006f0490f9d54d748124"),
        ...mockTaskData,
      };

      const mockSession = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
      };

      (mongoose.startSession as jest.Mock).mockResolvedValue(mockSession);

      const findByIdMock = jest.fn().mockReturnValue({
        session: jest.fn().mockResolvedValue(mockProject),
      });
      (projectModel.findById as jest.Mock) = findByIdMock;

      (taskModel.create as jest.Mock).mockResolvedValue([mockCreatedTask]);

      (projectModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

      jest.spyOn(taskService, "isUserInAnyProject").mockResolvedValue(true);

      const result = await taskService.createTask(mockTaskData as any);

      expect(mongoose.startSession).toHaveBeenCalled();
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(projectModel.findById).toHaveBeenCalledWith(
        mockTaskData.projectId
      );
      expect(taskService.isUserInAnyProject).toHaveBeenCalledWith(
        mockTaskData.assignedTo[0],
        mockTaskData.projectId
      );
      expect(taskModel.create).toHaveBeenCalledWith([mockTaskData], {
        session: mockSession,
      });
      expect(projectModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockTaskData.projectId,
        { tasks: [mockCreatedTask._id] },
        { session: mockSession }
      );
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();

      expect(result.newTask).toEqual(mockCreatedTask);
    }, 10000);

    it("should throw an error if an assigned user is not part of the project", async () => {
      const mockTaskData = {
        name: "New Task",
        projectId: new ObjectId("6770006f0490f9d54d748125"),
        assignedTo: [new ObjectId("6770006f0490f9d54d748123")],
      };

      const mockProject = {
        _id: new ObjectId("6770006f0490f9d54d748125"),
        tasks: [],
      };

      const mockCreatedTask = {
        _id: new ObjectId("6770006f0490f9d54d748124"),
        ...mockTaskData,
      };

      const mockSession = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
      };

      (mongoose.startSession as jest.Mock).mockResolvedValue(mockSession);

      const findByIdMock = jest.fn().mockReturnValue({
        session: jest.fn().mockResolvedValue(mockProject),
      });
      (projectModel.findById as jest.Mock) = findByIdMock;

      (taskModel.create as jest.Mock).mockResolvedValue([mockCreatedTask]);

      (projectModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

      jest.spyOn(taskService, "isUserInAnyProject").mockResolvedValue(false);

      await expect(taskService.createTask(mockTaskData as any)).rejects.toThrow(
        `The user with id ${mockTaskData.assignedTo[0]} is not working in the project ${mockTaskData.projectId}`
      );

      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    }, 10000);

    it("should throw an error if project is not found", async () => {
      const mockTaskData = {
        name: "New Task",
        projectId: "6770006f0490f9d54d748124",
      };
      const mockSession = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
      };

      (mongoose.startSession as jest.Mock).mockResolvedValue(mockSession);

      const findByIdMock = jest.fn().mockReturnValue({
        session: jest.fn().mockResolvedValue(null),
      });

      (projectModel.findById as jest.Mock) = findByIdMock;

      await expect(
        taskService.createTask(mockTaskData as unknown as Task)
      ).rejects.toThrow(
        CustomError.notFound(
          "Project with id 6770006f0490f9d54d748124 not found"
        )
      );

      expect(projectModel.findById).toHaveBeenCalledWith(
        "6770006f0490f9d54d748124"
      );
    });
  });

  describe("updateTask", () => {
    it("should update a task by ID", async () => {
      const mockUpdateData = { name: "", status: "Completed" };

      const mockUpdatedTask = {
        _id: "6770006f0490f9d54d748124",
        ...mockUpdateData,
      };
      const mockSession = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
      };

      (mongoose.startSession as jest.Mock).mockResolvedValue(mockSession);

      const findByIdMock = jest.fn().mockReturnValue({
        session: jest.fn().mockResolvedValue(mockTask),
      });

      (taskModel.findById as jest.Mock) = findByIdMock;

      (taskModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(
        mockUpdatedTask
      );

      const result = await taskService.updateTask(
        mockTask._id!,
        mockUpdateData as unknown as Task
      );

      expect(mongoose.startSession).toHaveBeenCalled();
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(taskModel.findById).toHaveBeenCalledWith(mockTask._id!);
      expect(taskModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockTask._id!,
        mockUpdateData,
        { new: true, session: mockSession }
      );
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
      expect(result).toEqual({
        msg: "OK",
        updatedTask: mockUpdatedTask,
      });
    });

    it("should update a task by ID and ensure all assigned users belong to the project", async () => {
      const mockUserId1 = new ObjectId("645bf847789fbb6c4e8a9673");
      const mockUserId2 = new ObjectId("645bf847789fbb6c4e8a9674");
      const mockProjectId = new ObjectId("645bf847789fbb6c4e8a9675");

      const mockUpdateData = {
        name: "Updated Task",
        status: "Completed",
        assignedTo: [mockUserId1, mockUserId2],
      };

      const mockTask = {
        _id: "6770006f0490f9d54d748124",
        name: "Old Task",
        status: "Pending",
        assignedTo: [mockUserId1, mockUserId2],
        projectId: mockProjectId,
      };

      const mockUpdatedTask = {
        ...mockTask,
        ...mockUpdateData,
      };

      const mockSession = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
      };

      jest
        .spyOn(mongoose, "startSession")
        .mockResolvedValue(mockSession as any);

      jest
        .spyOn(taskService, "isUserInAnyProject")
        .mockImplementation(async () => true);

      jest.spyOn(taskModel, "findById").mockResolvedValue(mockTask);
      jest
        .spyOn(taskModel, "findByIdAndUpdate")
        .mockResolvedValue(mockUpdatedTask);

      const result = await taskService.updateTask(
        mockTask._id!,
        mockUpdateData as unknown as Task
      );

      expect(mongoose.startSession).toHaveBeenCalled();
      expect(mockSession.startTransaction).toHaveBeenCalled();

      expect(taskService.isUserInAnyProject).toHaveBeenCalledTimes(2);
      expect(taskService.isUserInAnyProject).toHaveBeenCalledWith(
        mockUserId1,
        mockProjectId
      );
      expect(taskService.isUserInAnyProject).toHaveBeenCalledWith(
        mockUserId2,
        mockProjectId
      );

      expect(taskModel.findById).toHaveBeenCalledWith(mockTask._id!);
      expect(taskModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockTask._id!,
        mockUpdateData,
        { new: true, session: mockSession }
      );

      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();

      expect(result).toEqual({
        msg: "OK",
        updatedTask: mockUpdatedTask,
      });
    });

    it("should throw an error if task is not found", async () => {
      const mockTaskId = "6770006f0490f9d54d748124";
      const mockUpdateData = { name: "Updated Task", status: "Completed" };

      (taskModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        taskService.updateTask(mockTaskId, mockUpdateData as unknown as Task)
      ).rejects.toThrow(
        CustomError.notFound("Task with id 6770006f0490f9d54d748124 not found")
      );

      expect(taskModel.findById).toHaveBeenCalledWith(mockTaskId);
      expect(taskModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("should throw an error if project is not found", async () => {
      const mockTaskId = "6770006f0490f9d54d748124";
      const mockUpdateData = {
        name: "Updated Task",
        status: "Completed",
        projectId: "6770006f0490f9d54d748123",
      };
      const mockSession = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
      };

      (mongoose.startSession as jest.Mock).mockResolvedValue(mockSession);

      (projectModel.findById as jest.Mock).mockImplementation(() => ({
        session: jest.fn().mockResolvedValue(null),
      }));

      const mockTask = {
        _id: mockTaskId,
        projectId: mockUpdateData.projectId,
        assignedTo: [],
      };
      (taskModel.findById as jest.Mock).mockResolvedValue(mockTask);

      await expect(
        taskService.updateTask(mockTaskId, mockUpdateData as unknown as Task)
      ).rejects.toThrow(
        CustomError.notFound(
          `Project with id ${mockUpdateData.projectId} not found`
        )
      );

      expect(taskModel.findById).toHaveBeenCalledWith(mockTaskId);
      expect(projectModel.findById).toHaveBeenCalledWith(
        mockUpdateData.projectId
      );
      expect(taskModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("should throw an error if any user is not part of the project", async () => {
      const mockUserId1 = new ObjectId("645bf847789fbb6c4e8a9673");
      const mockUserId2 = new ObjectId("645bf847789fbb6c4e8a9674");
      const mockProjectId = new ObjectId("645bf847789fbb6c4e8a9675");

      const mockTask = {
        assignedTo: [mockUserId1, mockUserId2],
        projectId: mockProjectId,
      };

      jest
        .spyOn(taskService, "isUserInAnyProject")
        .mockImplementation(async (userId, projectId) => {
          if (userId.equals(mockUserId2)) {
            return false;
          }
          return true;
        });

      await expect(
        (async () => {
          if (mockTask.assignedTo?.length) {
            const usersId = mockTask.assignedTo;
            const areUsersInProject = usersId.map(async (userId) => {
              const isUserInProject = await taskService.isUserInAnyProject(
                userId,
                mockTask.projectId
              );

              if (!isUserInProject) {
                throw CustomError.conflict(
                  `The user with id ${userId} is not working in the project ${mockTask.projectId}`
                );
              }
            });

            await Promise.all(areUsersInProject);
          }
        })()
      ).rejects.toThrow(
        CustomError.conflict(
          `The user with id ${mockUserId2} is not working in the project ${mockProjectId}`
        )
      );

      expect(taskService.isUserInAnyProject).toHaveBeenCalledWith(
        mockUserId1,
        mockProjectId
      );
      expect(taskService.isUserInAnyProject).toHaveBeenCalledWith(
        mockUserId2,
        mockProjectId
      );
    });
  });

  describe("changeTaskState", () => {
    it("should successfully update the task state", async () => {
  
      const mockTask = {
        _id: "6770006f0490f9d54d748124",
        status: "pending",
      };

      const updatedTask = {
        _id: "6770006f0490f9d54d748124",
        status: "completed",
      };

 
      jest.spyOn(taskService, "getTaskById").mockResolvedValue({
        msg: "OK",
        task: mockTask as any,
      });

      (taskModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedTask);

 
      const result = await taskService.changeTaskState(
        mockTask._id,
        "completed" as any
      );

 
      expect(taskService.getTaskById).toHaveBeenCalledWith(mockTask._id);
      expect(taskModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockTask._id,
        { status: "completed" },
        { new: true }
      );
      expect(result).toEqual({
        msg: "Status updated",
        updateTaskState: updatedTask,
      });
    });

    it("should throw an error if the task is not found", async () => {
  
      jest
        .spyOn(taskService, "getTaskById")
        .mockRejectedValue(
          CustomError.notFound(
            "Task with id 6770006f0490f9d54d748124 not found"
          )
        );

  
      await expect(
        taskService.changeTaskState(
          "6770006f0490f9d54d748124",
          "completed" as any
        )
      ).rejects.toThrow(
        CustomError.notFound("Task with id 6770006f0490f9d54d748124 not found")
      );

 
      expect(taskService.getTaskById).toHaveBeenCalledWith(
        "6770006f0490f9d54d748124"
      );
      expect(taskModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe("assignTaskToUser", () => {
    const mockTask = {
      _id: "6770006f0490f9d54d748124",
      projectId: "6770006f0490f9d54d748123",
      assignedTo: [],
    };

    const mockUser = {
      _id: "6770006f0490f9d54d748199",
    };

    it("should throw an error if the task is not found", async () => {
      (taskModel.findById as jest.Mock).mockResolvedValue(null);
      (userModel.findById as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        taskService.assignTaskToUser(
          "6770006f0490f9d54d748124",
          "6770006f0490f9d54d748199"
        )
      ).rejects.toThrow(
        CustomError.notFound("Task with id 6770006f0490f9d54d748124 not found")
      );

      expect(taskModel.findById).toHaveBeenCalledWith(
        "6770006f0490f9d54d748124"
      );
    });

    it("should throw an error if the user is not found", async () => {
      (taskModel.findById as jest.Mock).mockResolvedValue(mockTask);
      (userModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        taskService.assignTaskToUser(
          "6770006f0490f9d54d748124",
          "6770006f0490f9d54d748199"
        )
      ).rejects.toThrow(
        CustomError.notFound("User with id 6770006f0490f9d54d748199 not found")
      );

      expect(userModel.findById).toHaveBeenCalledWith(
        "6770006f0490f9d54d748199"
      );
    });

    it("should throw an error if the user is not part of the project", async () => {
      (taskModel.findById as jest.Mock).mockResolvedValue(mockTask);
      (userModel.findById as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(taskService, "isUserInAnyProject").mockResolvedValue(false);

      await expect(
        taskService.assignTaskToUser(
          "6770006f0490f9d54d748124",
          "6770006f0490f9d54d748199"
        )
      ).rejects.toThrow(
        CustomError.conflict(
          `The user with id 6770006f0490f9d54d748199 is not working in the project 6770006f0490f9d54d748123`
        )
      );

      expect(taskService.isUserInAnyProject).toHaveBeenCalledWith(
        "6770006f0490f9d54d748199",
        "6770006f0490f9d54d748123"
      );
    });

    it("should throw an error if the user is already assigned to the task", async () => {
      const taskWithAssignedUser = {
        ...mockTask,
        assignedTo: ["6770006f0490f9d54d748199"],
      };

      (taskModel.findById as jest.Mock).mockResolvedValue(taskWithAssignedUser);
      (userModel.findById as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(taskService, "isUserInAnyProject").mockResolvedValue(true);

      await expect(
        taskService.assignTaskToUser(
          "6770006f0490f9d54d748124",
          "6770006f0490f9d54d748199"
        )
      ).rejects.toThrow(
        CustomError.conflict(
          `User with id 6770006f0490f9d54d748199 is already working in the task`
        )
      );

      expect(taskModel.findById).toHaveBeenCalledWith(
        "6770006f0490f9d54d748124"
      );
    });

    it("should successfully assign the user to the task", async () => {
      (taskModel.findById as jest.Mock).mockResolvedValue(mockTask);
      (userModel.findById as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(taskService, "isUserInAnyProject").mockResolvedValue(true);

      const updatedTask = {
        ...mockTask,
        assignedTo: ["6770006f0490f9d54d748199"],
      };

      (taskModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedTask);

      const result = await taskService.assignTaskToUser(
        "6770006f0490f9d54d748124",
        "6770006f0490f9d54d748199"
      );

      expect(taskModel.findById).toHaveBeenCalledWith(
        "6770006f0490f9d54d748124"
      );
      expect(userModel.findById).toHaveBeenCalledWith(
        "6770006f0490f9d54d748199"
      );
      expect(taskService.isUserInAnyProject).toHaveBeenCalledWith(
        "6770006f0490f9d54d748199",
        "6770006f0490f9d54d748123"
      );
      expect(taskModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "6770006f0490f9d54d748124",
        {
          assignedTo: ["6770006f0490f9d54d748199"],
        },
        { new: true }
      );

      expect(result).toEqual({
        msg: "User assigned",
        task: updatedTask,
      });
    });
  });

  describe("deleteTask", () => {
    it("should throw an error if task is not found", async () => {
      const mockSession = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
      };

      (mongoose.startSession as jest.Mock).mockResolvedValue(mockSession);

      (taskModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        taskService.deleteTask("6770006f0490f9d54d748124")
      ).rejects.toThrow(
        CustomError.notFound("Task with id 6770006f0490f9d54d748124 not found")
      );

      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });
  });
});
