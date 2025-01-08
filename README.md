# Task Management API

This project is a RESTful API for project and task management, developed with Node.js, Express, and MongoDB.

## Table of Contents

- [Setup](#setup)
- [API Documentation](#api-documentation)
- [Architecture and Design Decisions](#architecture-and-design-decisions)
- [Running Tests](#running-tests)
- [Important Information](#important-information)

## Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB

### Environment Variables

Create a .env file in the root directory with the following variables:

```
MONGO_URI=mongodb+srv://<your-mongo-user>:<your-mongo-password>@<your-cluster>/?retryWrites=true&w=majority&appName=Cluster0
MONGO_TEST_URI=mongodb+srv://<your-mongo-user>:<your-mongo-password>@<your-cluster>/?retryWrites=true&w=majority&appName=Cluster0
MONGO_DBNAME=oberstaff
PRIVATE_JWT=<jwt-secret>
SALT=10
NODE_ENV=development
SECRET_COOKIE=<cookie-secret>
PORT=8000
```

### Installation

1. Clone the repository

   ```
   git clone https://github.com/SantiagoArteche/ober-api.git
   ```

2. Move to the repository

   ```
   cd ober-api
   ```

3. Install dependencies:

   ```
   npm install
   ```

4. Configure environment variables

5. Start the server:

   ```
   npm start
   ```

The server will start on the port specified in the .env file (default is 8000).

# API Documentation

This document provides detailed information about the available endpoints, request parameters, and expected responses for the API.

## Important Information

### To access the routes, it is necessary to create a user and perform login to generate an authentication token which must be sent via the 'x-auth' header. Don't forget to do this step also within the API documentation at /api-docs.

## Authentication Endpoints

### **POST /api/auth/login**

- **Description**: User login.
- **Request Body**:

  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```

- **Response**:

  ```json
  {
    "msg": "Successful login",
    "token": "JWT token"
  }
  ```

### **GET /api/auth/logout/:token**

- **Description**: User logout.
- **Parameters**:
  - token: Authentication token.
- **Response**:

  ```json
  {
    "msg": "Successful logout"
  }
  ```

### **POST /api/auth/new-user**

- **Description**: Create a new user.
- **Request Body**:

  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string"
  }
  ```

- **Response**:

  ```json
  {
    "msg": "User created",
    "newUser": {
      "id": "string",
      "name": "string",
      "email": "string"
    }
  }
  ```

### **DELETE /api/auth/delete-user/:id**

- **Description**: Delete a user.
- **Parameters**:
  - id: User ID.
- **Response**:

  ```json
  {
    "msg": "User with id 6770009c69de7bafa52b6087 was deleted"
  }
  ```

## Project Endpoints

### **GET /api/projects**

- **Description**: Returns all projects.
- **Query Parameters**:
  - skip (optional): Number of records to skip.
  - limit (optional): Number of records to retrieve.
- **Response**:

  ```json
  [
    {
      "msg": "OK",
      "projects": [
        {
          "_id": "6770155f8c4daac8074336d1",
          "name": "Project 1",
          "users": ["676ff254b92393694409c775", "6770006f0490f9d54d748125"],
          "tasks": ["676ff254b92393694409c335"]
        }
      ]
    }
  ]
  ```

### **GET /api/projects/:id**

- **Description**: Get a project by its ID.
- **Parameters**:
  - id: Project ID.
- **Response**:

  ```json
  {
    "msg": "OK",
    "project": {
      "_id": "6770155f8c4daac8074336d1",
      "name": "Project 1",
      "users": ["676ff254b92393694409c775", "6770006f0490f9d54d748125"],
      "tasks": ["676ff254b92393694409c335"]
    }
  }
  ```

### **POST /api/projects**

- **Description**: Create a new project.
- **Request Body**:

  ```json
  {
    "name": "string",
    "users": ["string"]
  }
  ```

- **Response**:

  ```json
  {
    "msg": "Project created",
    "newProject": {
      "name": "New Project",
      "users": [],
      "tasks": [],
      "_id": "6772f28cda565c261cf9b072"
    }
  }
  ```

### **PUT /api/projects/:id**

- **Description**: Update a project.
- **Parameters**:
  - id: Project ID.
- **Request Body**:

  ```json
  {
    "name": "string",
    "users": ["string"]
  }
  ```

- **Response**:

  ```json
  {
    "msg": "Project updated",
    "updatedProject": {
      "_id": "6772f28cda565c261cf9b072",
      "name": "Updated Project",
      "users": [],
      "tasks": []
    }
  }
  ```

### **DELETE /api/projects/:id**

- **Description**: Delete a project.
- **Parameters**:
  - id: Project ID.
- **Response**:

  ```json
  {
    "msg": "Project with id 6772f28cda565c261cf9b072 was deleted"
  }
  ```

### **PUT /api/projects/:projectId/users/:userId**

- **Description**: Assign a user to a project.
- **Parameters**:
  - projectId: Project ID.
  - userId: User ID.
- **Response**:

  ```json
  {
    "msg": "User with id: 677002b4dfecb23242e44222 successfully assigned to project with id: 6770155f8c4daac8074336d1",
    "projectUpdated": {
      "_id": "6770155f8c4daac8074336d1",
      "name": "Project 1",
      "users": [
        "676ff254b92393694409c775",
        "6770006f0490f9d54d748125",
        "677002b4dfecb23242e44222"
      ],
      "tasks": []
    }
  }
  ```

## Task Endpoints

### **GET /api/tasks**

- **Description**: Retrieve all tasks.
- **Query Parameters**:
  - status (optional): Filter tasks by status.
  - endDate (optional): Filter tasks by end date.
  - userAssigned (optional): Filter tasks by assigned user.
  - skip (optional): Number of records to skip.
  - limit (optional): Number of records to return.
- **Response**:

  ```json
  {
    "msg": "OK",
    "tasks": [
      {
        "description": "Desc 1",
        "startDate": "2024-12-30T19:25:43.640Z",
        "endDate": "2024-12-31T19:25:43.640Z",
        "_id": "67705ad66b5f245eadd4531d",
        "title": "Task 1",
        "assignedTo": ["676ff105faab8854b63521e5"],
        "status": "pending"
      }
    ]
  }
  ```

### **GET /api/tasks/:id**

- **Description**: Get a task by its ID.
- **Parameters**:
  - id: Task ID.
- **Response**:

  ```json
  {
    "msg": "OK",
    "task": {
      "description": "Desc 1",
      "startDate": "2024-12-30T19:25:43.640Z",
      "endDate": "2024-12-30T19:25:43.640Z",
      "_id": "67705ad66b5f245eadd4531d",
      "title": "Task 1",
      "assignedTo": ["676ff105faab8854b63521e5"],
      "status": "pending"
    }
  }
  ```

### **GET /api/tasks/name/:name**

- **Description**: Get tasks by their name.
- **Parameters**:
  - name: Task name.
- **Response**:

  ```json
  {
    "msg": "OK",
    "task": [
      {
        "startDate": "2024-12-30T19:25:43.640Z",
        "endDate": "2024-12-31T19:25:43.640Z",
        "_id": "67708a02278324ef332b8746",
        "name": "Name 1",
        "description": "Desc 1",
        "assignedTo": ["677000838a96c0de55087f3b"],
        "status": "in progress"
      },
      {
        "startDate": "2024-12-30T19:25:43.640Z",
        "endDate": "2025-01-30T19:25:43.640Z",
        "_id": "68808a02278324ef332b8746",
        "name": "Name 1",
        "description": "Desc 2",
        "assignedTo": ["677000838a96c0de55087f3b"],
        "status": "in progress"
      }
    ]
  }
  ```

### **GET /api/tasks/description/:description**

- **Description**: Get tasks by their description.
- **Parameters**:
  - description: Task description.
- **Response**:

  ```json
  {
    "msg": "OK",
    "task": [
      {
        "startDate": "2024-12-30T19:25:43.640Z",
        "endDate": "2024-12-31T19:25:43.640Z",
        "_id": "67708a02278324ef332b8746",
        "name": "Name 1",
        "description": "Desc 1",
        "assignedTo": ["677000838a96c0de55087f3b"],
        "status": "in progress"
      },
      {
        "startDate": "2024-12-30T19:25:43.640Z",
        "endDate": "2025-01-30T19:25:43.640Z",
        "_id": "68808a02278324ef332b8746",
        "name": "Name 2",
        "description": "Desc 1",
        "assignedTo": ["677000838a96c0de55087f3b"],
        "status": "in progress"
      }
    ]
  }
  ```

### **POST /api/tasks**

- **Description**: Create a new task.
- **Request Body**:

  ```json
  {
    "name": "string",
    "description": "string",
    "assignedTo": "string",
    "status": "string",
    "endDate": "date",
    "projectId": "string"
  }
  ```

- **Response**:

  ```json
  {
    "msg": "OK",
    "newTask": {
      "name": "New Task",
      "description": "Description 3",
      "assignedTo": ["6770009c69de7bafa52b6087"],
      "projectId": "677015698c4daac8074336d5",
      "status": "pending",
      "startDate": "2024-12-30T19:25:43.640Z",
      "endDate": "2024-12-31T00:00:00.000Z",
      "_id": "6772f4723f6eb58292f0fd6b"
    }
  }
  ```

### **PUT /api/tasks/:id**

- **Description**: Update a task by its id.
- **Parameters**:
  - id: Task ID.
- **Request Body**:

  ```json
  {
    "name": "string",
    "description": "string",
    "assignedTo": "string",
    "status": "string",
    "endDate": "date",
    "projectId": "string"
  }
  ```

- **Response**:

  ```json
  {
    "msg": "OK",
    "updatedTask": {
      "_id": "6772f4723f6eb58292f0fd6b",
      "name": "Updated Task",
      "description": "Empty description",
      "assignedTo": ["6770009c69de7bafa52b6087"],
      "projectId": "677015698c4daac8074336d5",
      "status": "in progress",
      "startDate": "2024-12-30T19:25:43.640Z",
      "endDate": "2025-01-12T00:00:00.000Z"
    }
  }
  ```

### **PUT /api/tasks/state/:id**

- **Description**: Change the status of a task.
- **Parameters**:
  - id: Task ID.
- **Request Body**:

  ```json
  {
    "status": "string"
  }
  ```

- **Response**:

  ```json
  {
    "msg": "Status updated",
    "updateTaskState": {
      "_id": "6772f4723f6eb58292f0fd6b",
      "name": "Task 1",
      "description": "Empty description",
      "assignedTo": ["6770009c69de7bafa52b6087"],
      "projectId": "677015698c4daac8074336d5",
      "status": "completed",
      "startDate": "2024-12-30T19:25:43.640Z",
      "endDate": "2024-11-31T00:00:00.000Z"
    }
  }
  ```

### **PUT /api/tasks/:taskId/users/:userId**

- **Description**: Assign task to an user.
- **Parámetros**:
  - `taskId`: Task ID.
  - `userId`: User ID.
- **Respuesta**:
  ```json
  {
    "msg": "User assigned",
    "task": {
      "_id": "6772f4723f6eb58292f0fd6b",
      "name": "Task 1",
      "description": "Empty description",
      "assignedTo": ["6770009c69de7bafa52b6087", "677002b4dfecb23242e44222"],
      "projectId": "677015698c4daac8074336d5",
      "status": "in progress",
      "startDate": "2024-12-30T19:25:43.640Z",
      "endDate": "2024-11-11T00:00:00.000Z"
    }
  }
  ```

### **DELETE /api/tasks/:id**

- **Description**: Delete a task by its id.
- **Parámetros**:
  - `id`: Task ID.
- **Respuesta**:
  ```json
  {
    "msg": "Task with id 6772f4723f6eb58292f0fd6b was deleted"
  }
  ```

## Additional Information

For detailed examples of requests and responses, visit the Swagger documentation available at /api-docs when the server is running.

## Architecture and Design Decisions

This project follows a modular architecture with a clear separation of responsibilities:

1. **Routes**: Define the API endpoints and link them with the corresponding controllers.
2. **Controllers**: Handle HTTP requests, invoke necessary services, and send responses.
3. **Services**: Implement business logic, interact with the database, and manage complex operations.
4. **Models**: Define the data structure for MongoDB documents.
5. **Middlewares**: Manage cross-cutting concerns such as authentication and error handling.
6. **Validations**: Ensure the integrity of incoming data.

Design decisions:

- **TypeScript**: Used for static typing, improving code quality and maintainability.
- **Express.js**: Chosen as the web framework for its simplicity and flexibility.
- **MongoDB**: Selected as the database for its flexibility with document-based storage and scalability.
- **JWT Authentication**: Implemented for secure user authentication and stateless authorization.
- **Error Handling**: Centralized error handling with custom classes for consistent error responses.
- **Validation**: Input validation through middlewares to ensure data integrity and security.
- **Modular Structure**: Code organized into modules (authentication, projects, tasks) for better maintainability and scalability.
- **Environment Configuration**: Use of dotenv to manage environment-specific configurations, enhancing security and deployment flexibility.
- **Logging**: Implementation of winston for improved debugging, monitoring, and application insights.
- **API Documentation**: Swagger integration for clear, interactive API documentation.
- **Testing**: Comprehensive unit and integration tests to ensure reliability and ease of maintenance.

## Running Tests

To ensure the reliability and correctness of the API, we have implemented a comprehensive test suite. Follow these steps to run the tests:

1. Run all tests:

   ```
   npm run test
   ```

   This command will execute all test suites and provide a summary of the results.

2. Watch for changes and run tests automatically:

   ```
   npm run test:watch
   ```

   This command will start the test runner in watch mode, automatically re-running tests when files are changed.

3. Generate test coverage report:

   ```
   npm run test:coverage
   ```

   This command will run the tests and generate a detailed coverage report, showing which parts of the code are covered by tests.
