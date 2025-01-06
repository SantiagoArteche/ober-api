# API de Gestión de Tareas

Este proyecto es una API RESTful para la gestión de proyectos y tareas, desarrollada con Node.js, Express y MongoDB.

## Tabla de Contenidos

- [Configuración](#configuración)
- [Documentación de la API](#documentación-de-la-api)
- [Arquitectura y Decisiones de Diseño](#arquitectura-y-decisiones-de-diseño)
- [Ejecutar Pruebas](#ejecutar-pruebas)
- [Información Importante](#información-importante)

## Configuración

### Requisitos Previos

- Node.js (v14 o superior)
- MongoDB

### Variables de Entorno

Crea un archivo .env en el directorio raíz con las siguientes variables:

```
MONGO_URI=mongodb+srv://ADMIN:P6Re8JjLo91IGrU1@cluster0.eyrdb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
MONGO_TEST_URI=mongodb+srv://santiarteche:T4Takngkm5B5U0X2@cluster0.6owrt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
MONGO_DBNAME=oberstaff
PRIVATE_JWT=2f9a1a143243ec99f248e9a48fdf34ae0c0216f1f8f66c89ef4af6f15877fbe4
SALT=10
NODE_ENV=development
SECRET_COOKIE=cookie-san-123
PORT=8000
```

### Instalación

1. Clonar el repositorio

   ```
   git clone https://github.com/SantiagoArteche/ober-node.git
   ```

2. Moverse al repositorio

   ```
   cd ober-node
   ```

3. Instalar las dependencias:

   ```
   npm install
   ```

4. Configurar variables de entorno

5. Iniciar el servidor:

   ```
   npm start
   ```

El servidor se iniciará en el puerto especificado en el archivo .env (por defecto es el 8000).

# Documentación de la API

Este documento proporciona información detallada sobre los endpoints disponibles, los parámetros de solicitud y las respuestas esperadas para la API.

## Información Importante

### Para acceder a las rutas, es necesario crear un usuario y realizar el login para generar un token de autenticación el cual debe ser enviado mediante el header 'x-auth'. No olvide realizar este paso también dentro de la documentación de la API en /api-docs.

## Authentication Endpoints

### **POST /api/auth/login**

- **Descripción**: Inicio de sesión del usuario.
- **Cuerpo de la Solicitud**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Respuesta**:

  ```json
  {
    "msg": "Successful login",
    "token": "JWT token"
  }
  ```

### **GET /api/auth/logout/:token**

- **Descripción**: Cierre de sesión del usuario.
- **Parámetros**:
  - `token`: Token de autenticación.
- **Respuesta**:
  ```json
  {
    "msg": "Successful logout"
  }
  ```

### **POST /api/auth/new-user**

- **Description**: Crear un nuevo usuario.
- **Cuerpo de la Solicitud**:
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Respuesta**:
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

- **Description**: Borrar un usuario.
- **Parámetros**:
  - `id`: ID del usuario.
- **Respuesta**:
  ```json
  {
    "msg": "User with id 6770009c69de7bafa52b6087 was deleted"
  }
  ```

## Project Endpoints

### **GET /api/projects**

- **Description**: Devuelve todos los projects.
- **Query Parámetros**:
  - `skip` (opcional): Número de registros a omitir.
  - `limit` (opcional): Números de registros que quiero recuperar.
- **Respuesta**:
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

- **Description**: Obtener un proyecto por su ID.
- **Parámetros**:
  - `id`: ID del proyecto.
- **Respuesta**:
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

- **Description**: Crear un nuevo proyecto.
- **Cuerpo de la Solicitud**:
  ```json
  {
    "name": "string",
    "users": ["string"]
  }
  ```
- **Respuesta**:
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

- **Description**: Actualizar un proyecto.
- **Parámetros**:
  - `id`: ID del proyecto.
- **Cuerpo de la Solicitud**:
  ```json
  {
    "name": "string",
    "users": ["string"]
  }
  ```
- **Respuesta**:
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

- **Description**: Borrar un proyecto.
- **Parámetros**:
  - `id`: ID del proyecto.
- **Respuesta**:
  ```json
  {
    "msg": "Project with id 6772f28cda565c261cf9b072 was deleted"
  }
  ```

### **PUT /api/projects/:projectId/users/:userId**

- **Description**: Asignar un usuario a un proyecto.
- **Parámetros**:
  - `projectId`: ID del proyecto.
  - `userId`: ID del usuario.
- **Respuesta**:
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

- **Description**: Recuperar todas las tareas.
- **Query Parámetros**:
  - `status` (opcional): Filtrar tareas por estado.
  - `endDate` (opcional): Filtrar tareas por fecha límite.
  - `userAssigned` (opcional): Filtrar tareas por usuario asignado.
  - `skip` (opcional): Número de registros a omitir.
  - `limit` (opcional): Número de registros a devolver.
- **Respuesta**:
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

- **Description**: Obtener un a tarea por su ID.
- **Parámetros**:
  - `id`: ID de la tarea.
- **Respuesta**:
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

- **Description**: Obtener tareas por su nombre.
- **Parámetros**:
  - `name`: Nombre de la tarea.
- **Respuesta**:
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

- **Description**: Obtener tareas por su descripción.
- **Parámetros**:
  - `description`: Descripción de la tarea.
- **Respuesta**:
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

- **Description**: Crear una nueva tarea.
- **Cuerpo de la Solicitud**:
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
- **Respuesta**:
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

- **Description**: Actualizar una tarea por su id.
- **Parámetros**:
  - `id`: ID de la tarea.
- **Cuerpo de la Solicitud**:
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
- **Respuesta**:
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

- **Description**: Cambiar el estado de una tarea.
- **Parámetros**:
  - `id`: ID de la tarea.
- **Cuerpo de la Solicitud**:
  ```json
  {
    "status": "string"
  }
  ```
- **Respuesta**:
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

- **Description**: Asignar tarea a un usuario.
- **Parámetros**:
  - `taskId`: ID de la tarea.
  - `userId`: ID del usuario.
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

- **Description**: Borrar tarea por su ID.
- **Parámetros**:
  - `id`: ID de la tarea.
- **Respuesta**:
  ```json
  {
    "msg": "Task with id 6772f4723f6eb58292f0fd6b was deleted"
  }
  ```

## Información Adicional

Para ejemplos detallados de solicitudes y respuestas, visita la documentación de Swagger disponible en /api-docs cuando el servidor esté en funcionamiento.

## Arquitectura y Decisiones de Diseño

Este proyecto sigue una arquitectura modular con una clara separación de responsabilidades:

1. **Routes**: Definen los endpoints de la API y los vinculan con los controladores correspondientes.
2. **Controllers**: Manejan las solicitudes HTTP, invocan los servicios necesarios y envían respuestas.
3. **Services**: Implementan la lógica de negocio, interactúan con la base de datos y gestionan operaciones complejas.
4. **Models**: Definen la estructura de datos para los documentos de MongoDB.
5. **Middlewares**: Gestionan aspectos transversales como la autenticación y el manejo de errores.
6. **Validations**: Aseguran la integridad de los datos entrantes.

Decisiones de diseño:

- **TypeScript**: Usado para el tipado estático, mejorando la calidad y mantenibilidad del código.
- **Express.js**: Elegido como framework web por su simplicidad.
- **MongoDB**: Seleccionado como base de datos por su flexibilidad con el almacenamiento basado en documentos.
- **Autenticación con JWT**: Implementada para una autenticación de usuarios segura.
- **Manejo de Errores**: Manejo centralizado de errores con clases personalizadas.
- **Validación**: Validación de entrada mediante middlewares para garantizar la integridad de los datos.
- **Estructura Modular**: Código organizado en módulos (autenticación, proyectos, tareas) para una mejor mantenibilidad y escalabilidad.
- **Configuración de Entorno**: Uso de dotenv para gestionar configuraciones específicas del entorno.
- **Registro de Logs**: Implementación de winston para mejorar la depuración y el monitoreo.

## Ejecutar pruebas

1. Realizar pruebas:

   ```
   npm run test
   ```

2. Ver cambios en directo:

   ```
   npm run test:watch
   ```

3. Generar coverage:

   ```
   npm run test:coverage
   ```
