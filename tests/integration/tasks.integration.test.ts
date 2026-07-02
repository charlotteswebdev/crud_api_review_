import request from "supertest";
import app from "../../src/app";
import { seedTestData, cleanupTestData } from "../fixtures/seed";

describe("Task Integration Tests", () => {
  let seedDataIds: { taskIds: number[]; projectIds: number[] } = {
    taskIds: [],
    projectIds: [],
  };

  beforeAll(async () => {
    await seedTestData();
    // Get the IDs of seeded tasks and projects
    const tasksResponse = await request(app).get("/tasks");
    if (tasksResponse.body.length >= 3) {
      seedDataIds.taskIds = tasksResponse.body.slice(0, 3).map((t: any) => t.id);
      seedDataIds.projectIds = [
        ...new Set(
          tasksResponse.body
            .slice(0, 3)
            .map((t: any) => t.project_id as number)
        ),
      ] as number[];
    }
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe("GET /tasks", () => {
    it("should return all tasks", async () => {
      const response = await request(app).get("/tasks");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(3); // At least 3 seeded tasks
    });

    it("should filter tasks by project_id", async () => {
      const projectId = seedDataIds.projectIds[0] || 1;
      const response = await request(app).get(`/tasks?project_id=${projectId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      // All returned tasks should be from the specified project
      response.body.forEach((task: any) => {
        expect(task.project_id).toBe(projectId);
      });
    });
  });

  describe("GET /tasks/:id", () => {
    it("should return a task by ID", async () => {
      const taskId = seedDataIds.taskIds[0] || 1;
      const response = await request(app).get(`/tasks/${taskId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("title");
    });

    it("should return 404 for non-existent task", async () => {
      const response = await request(app).get("/tasks/9999");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Task not found");
    });
  });

  describe("POST /tasks", () => {
    it("should create a new task", async () => {
      const projectId = seedDataIds.projectIds[0] || 1;
      const response = await request(app).post("/tasks").send({
        title: "New Task",
        status: "pending",
        project_id: projectId,
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("insertId");
    });

    it("should return 400 if required fields are missing", async () => {
      const response = await request(app).post("/tasks").send({
        title: "Task without status",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("PUT /tasks/:id", () => {
    it("should update a task", async () => {
      const taskId = seedDataIds.taskIds[0] || 1;
      const projectId = seedDataIds.projectIds[0] || 1;
      const response = await request(app).put(`/tasks/${taskId}`).send({
        title: "Updated Task",
        status: "in-progress",
        project_id: projectId,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Task updated");
    });

    it("should return 404 for non-existent task", async () => {
      const projectId = seedDataIds.projectIds[0] || 1;
      const response = await request(app).put("/tasks/9999").send({
        title: "Non-existent",
        status: "pending",
        project_id: projectId,
      });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Task not found");
    });
  });

  describe("DELETE /tasks/:id", () => {
    it("should delete a task", async () => {
      // Create a task to delete
      const projectId = seedDataIds.projectIds[0] || 1;
      const createResponse = await request(app).post("/tasks").send({
        title: "Task to Delete",
        status: "pending",
        project_id: projectId,
      });

      const taskId = createResponse.body.insertId;

      // Then delete it
      const deleteResponse = await request(app).delete(`/tasks/${taskId}`);

      expect(deleteResponse.status).toBe(204);
    });

    it("should return 404 for non-existent task", async () => {
      const response = await request(app).delete("/tasks/9999");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Task not found");
    });
  });
});
