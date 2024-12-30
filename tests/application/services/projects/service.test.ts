import { projectModel } from "../../../../src/infraestructure/data/mongo-db/models/project.model";
import { taskModel } from "../../../../src/infraestructure/data/mongo-db/models/task.model";
import { userModel } from "../../../../src/infraestructure/data/mongo-db/models/user.model";
import { CustomError } from "../../../../src/domain/errors/custom-errors";
import { ProjectService } from "../../../../src/application/services/projects/service";

jest.mock(
  "../../../../src/infraestructure/data/mongo-db/models/project.model",
  () => ({
    projectModel: {
      find: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      countDocuments: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
    },
  })
);

jest.mock(
  "../../../../src/infraestructure/data/mongo-db/models/task.model",
  () => ({
    taskModel: {
      findByIdAndDelete: jest.fn(),
    },
  })
);

jest.mock(
  "../../../../src/infraestructure/data/mongo-db/models/user.model",
  () => ({
    userModel: {
      findById: jest.fn(),
    },
  })
);

jest.mock("mongoose", () => ({
  startSession: jest.fn().mockResolvedValue({
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
  }),
}));

describe("ProjectService", () => {
  const projectService = new ProjectService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllProjects", () => {
    it("should fetch all projects with pagination", async () => {
      const mockProjects = [
        {
          _id: "6770006f0490f9d54d748125",
          name: "Project A",
          tasks: [
            {
              _id: "676ff105faab8854b63521e9",
              name: "Task 1",
              status: "Completed",
            },
          ],
        },
        {
          _id: "6770006f0490f9d54d748129",
          name: "Project B",
          tasks: [
            {
              _id: "676ff105faab8854b63521e5",
              name: "Task 2",
              status: "In Progress",
            },
          ],
        },
      ];

      const mockPopulate = jest.fn().mockResolvedValue(mockProjects);

      (projectModel.find as jest.Mock).mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        populate: mockPopulate,
      });

      (projectModel.countDocuments as jest.Mock).mockResolvedValue(2);

      const result = await projectService.getAllProjects({
        skip: 0,
        limit: 10,
      });

      expect(projectModel.find).toHaveBeenCalled();
      expect(mockPopulate).toHaveBeenCalledWith("tasks", "_id name status");
      expect(projectModel.countDocuments).toHaveBeenCalled();
      expect(result.projects).toEqual(mockProjects);
      expect(result.totalDocuments).toBe(2);
      expect(result.totalPages).toBe(1);
    });
  });

  describe("getProjectById", () => {
    it("should fetch a project by ID", async () => {
      const mockProject = {
        _id: "676ff105faab8854b63521e59",
        name: "Project A",
      };
      (projectModel.findById as jest.Mock).mockResolvedValue(mockProject);

      const result = await projectService.getProjectById(
        "676ff105faab8854b63521e59"
      );

      expect(projectModel.findById).toHaveBeenCalledWith(
        "676ff105faab8854b63521e59"
      );
      expect(result.project).toEqual(mockProject);
    });

    it("should throw an error if project is not found", async () => {
      (projectModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        projectService.getProjectById("676ff105faab8854b63521e59")
      ).rejects.toThrow(
        CustomError.notFound(
          `Project with id 676ff105faab8854b63521e59 not found`
        )
      );
    });
  });

  describe("createProject", () => {
    it("should create a new project", async () => {
      const mockProjectData = { name: "New Project", users: [] };
      const mockCreatedProject = {
        _id: "676ff105faab8854b63521e59",
        ...mockProjectData,
      };
      (projectModel.create as jest.Mock).mockResolvedValue(mockCreatedProject);

      const result = await projectService.createProject(mockProjectData);

      expect(projectModel.create).toHaveBeenCalledWith({
        name: "New Project",
        users: [],
      });
      expect(result.newProject).toEqual(mockCreatedProject);
    });
  });

  describe("updateProjectById", () => {
    it("should update a project by ID", async () => {
      const mockProjectId = "676ff105faab8854b63521e5";
      const mockUpdateData = {
        name: "Updated Project",
        users: ["676ff105faab8854b63521e7", "676ff105faab8854b63521e8"],
      };
      const mockExistingProject = {
        _id: mockProjectId,
        name: "Old Project",
        users: [],
      };
      const mockUpdatedProject = { _id: mockProjectId, ...mockUpdateData };

      (projectModel.findById as jest.Mock).mockResolvedValue(
        mockExistingProject
      );
      (projectModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(
        mockUpdatedProject
      );

      const result = await projectService.updateProject(
        mockProjectId,
        mockUpdateData
      );

      expect(projectModel.findById).toHaveBeenCalledWith(mockProjectId);
      expect(projectModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockProjectId,
        {
          name: "Updated Project",
          users: ["676ff105faab8854b63521e7", "676ff105faab8854b63521e8"],
        },
        { new: true }
      );
      expect(result).toEqual({
        msg: "Project updated",
        updatedProject: mockUpdatedProject,
      });
    });

    it("should throw an error if the project does not exist", async () => {
      const mockProjectId = "676ff105faab8854b63521e5";
      const mockUpdateData = {
        name: "Updated Project",
        users: ["676ff105faab8854b63521e9", "676ff105faab8854b63521e8"],
      };

      (projectModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        projectService.updateProject(mockProjectId, mockUpdateData)
      ).rejects.toThrow("Project with id 676ff105faab8854b63521e5 not found");

      expect(projectModel.findById).toHaveBeenCalledWith(mockProjectId);
      expect(projectModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("should throw an error if the update fails", async () => {
      const mockProjectId = "676ff105faab8854b63521e5";
      const mockUpdateData = {
        name: "Updated Project",
        users: ["676ff105faab8854b63521e0", "676ff105faab8854b63521e3"],
      };
      const mockExistingProject = {
        _id: mockProjectId,
        name: "Old Project",
        users: [],
      };

      (projectModel.findById as jest.Mock).mockResolvedValue(
        mockExistingProject
      );
      (projectModel.findByIdAndUpdate as jest.Mock).mockRejectedValue(
        new Error("Update failed")
      );

      await expect(
        projectService.updateProject(mockProjectId, mockUpdateData)
      ).rejects.toThrow("Update failed");

      expect(projectModel.findById).toHaveBeenCalledWith(mockProjectId);
      expect(projectModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockProjectId,
        {
          name: "Updated Project",
          users: ["676ff105faab8854b63521e0", "676ff105faab8854b63521e3"],
        },
        { new: true }
      );
    });
  });

  describe("deleteProjectById", () => {
    it("should delete a project by ID", async () => {
      const mockProject = { _id: "676ff105faab8854b63521e59", tasks: [] };
      (projectModel.findById as jest.Mock).mockResolvedValue(mockProject);
      (projectModel.findByIdAndDelete as jest.Mock).mockResolvedValue({});

      const result = await projectService.deleteProjectById(
        "676ff105faab8854b63521e59"
      );

      expect(projectModel.findById).toHaveBeenCalledWith(
        "676ff105faab8854b63521e59"
      );
      expect(projectModel.findByIdAndDelete).toHaveBeenCalledWith(
        "676ff105faab8854b63521e59",
        expect.any(Object)
      );
      expect(result.msg).toEqual(
        "Project with id 676ff105faab8854b63521e59 was deleted"
      );
    });

    it("should delete associated tasks of a project", async () => {
      const mockProject = {
        _id: "676ff105faab8854b63521e5",
        tasks: [
          { _id: "676ff105faab8854b63521e8" },
          { _id: "676ff105faab8854b63521e59" },
        ],
      };
      (projectModel.findById as jest.Mock).mockResolvedValue(mockProject);
      (taskModel.findByIdAndDelete as jest.Mock).mockResolvedValue({});
      (projectModel.findByIdAndDelete as jest.Mock).mockResolvedValue({});

      const result = await projectService.deleteProjectById(
        "676ff105faab8854b63521e5"
      );

      expect(taskModel.findByIdAndDelete).toHaveBeenCalledTimes(2);
      expect(taskModel.findByIdAndDelete).toHaveBeenCalledWith(
        "676ff105faab8854b63521e8",
        expect.any(Object)
      );
      expect(taskModel.findByIdAndDelete).toHaveBeenCalledWith(
        "676ff105faab8854b63521e59",
        expect.any(Object)
      );
      expect(result.msg).toEqual(
        "Project with id 676ff105faab8854b63521e5 was deleted"
      );
    });
  });

  describe("assignUserToProject", () => {
    it("should assign a user to a project", async () => {
      const mockProject = { _id: "677015698c4daac8074336d5", users: [] };
      const mockUser = { _id: "676ff105faab8854b63521e59" };

      (projectModel.findById as jest.Mock).mockResolvedValue(mockProject);
      (userModel.findById as jest.Mock).mockResolvedValue(mockUser);
      (projectModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        ...mockProject,
        users: ["676ff105faab8854b63521e59"],
      });

      const result = await projectService.assignUserToProject(
        "677015698c4daac8074336d5",
        "676ff105faab8854b63521e59"
      );

      expect(projectModel.findById).toHaveBeenCalledWith(
        "677015698c4daac8074336d5"
      );
      expect(userModel.findById).toHaveBeenCalledWith(
        "676ff105faab8854b63521e59"
      );
      expect(projectModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "677015698c4daac8074336d5",
        { users: ["676ff105faab8854b63521e59"] },
        { new: true }
      );
      expect(result.projectUpdated?.users).toContain(
        "676ff105faab8854b63521e59"
      );
    });
  });
});
