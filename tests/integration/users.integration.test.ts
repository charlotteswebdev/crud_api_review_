import request from "supertest";
import app from "../../src/app";
import { seedTestData, cleanupTestData } from "../fixtures/seed";

describe("User Integration Tests", () => {
  let seedDataIds: { userIds: number[] } = { userIds: [] };

  beforeAll(async () => {
    await seedTestData();
    // Get the IDs of seeded users
    const response = await request(app).get("/users");
    if (response.body.length >= 3) {
      seedDataIds.userIds = response.body.slice(0, 3).map((u: any) => u.id);
    }
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe("GET /users", () => {
    it("should return all users", async () => {
      const response = await request(app).get("/users");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(3); // At least 3 seeded users
      expect(response.body[0]).toHaveProperty("id");
      expect(response.body[0]).toHaveProperty("name");
      expect(response.body[0]).toHaveProperty("email");
    });
  });

  describe("GET /users/:id", () => {
    it("should return a user by ID", async () => {
      const userId = seedDataIds.userIds[0] || 1;
      const response = await request(app).get(`/users/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("name");
      expect(response.body).toHaveProperty("email");
    });

    it("should return 404 for non-existent user", async () => {
      const response = await request(app).get("/users/9999");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "User not found");
    });
  });

  describe("POST /users", () => {
    it("should create a new user", async () => {
      const response = await request(app).post("/users").send({
        name: "David",
        email: `david+${Date.now()}@example.com`,
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("insertId");
    });

    it("should return 400 if name is missing", async () => {
      const response = await request(app).post("/users").send({
        email: "test@example.com",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("should return 400 if email is missing", async () => {
      const response = await request(app).post("/users").send({
        name: "Test User",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("PUT /users/:id", () => {
    it("should update a user", async () => {
      const userId = seedDataIds.userIds[0] || 1;
      const response = await request(app).put(`/users/${userId}`).send({
        name: "Alice Updated",
        email: `alice.updated+${Date.now()}@example.com`,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "User updated");
    });

    it("should return 404 for non-existent user", async () => {
      const response = await request(app).put("/users/9999").send({
        name: "Non-existent",
        email: "nonexistent@example.com",
      });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "User not found");
    });

    it("should return 400 if validation fails", async () => {
      const userId = seedDataIds.userIds[0] || 1;
      const response = await request(app).put(`/users/${userId}`).send({
        name: "",
        email: "test@example.com",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("DELETE /users/:id", () => {
    it("should delete a user", async () => {
      // First create a user to delete
      const createResponse = await request(app).post("/users").send({
        name: "Temp User",
        email: `temp+${Date.now()}@example.com`,
      });

      const userId = createResponse.body.insertId;

      // Then delete it
      const response = await request(app).delete(`/users/${userId}`);

      expect(response.status).toBe(204);
    });

    it("should return 404 for non-existent user", async () => {
      const response = await request(app).delete("/users/9999");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "User not found");
    });
  });
});
