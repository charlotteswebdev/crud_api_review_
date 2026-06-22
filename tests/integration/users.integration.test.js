"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../src/app"));
const seed_1 = require("../fixtures/seed");
describe("User Integration Tests", () => {
    let seedDataIds = { userIds: [] };
    beforeAll(async () => {
        await (0, seed_1.seedTestData)();
        // Get the IDs of seeded users
        const response = await (0, supertest_1.default)(app_1.default).get("/users");
        if (response.body.length >= 3) {
            seedDataIds.userIds = response.body.slice(0, 3).map((u) => u.id);
        }
    });
    afterAll(async () => {
        await (0, seed_1.cleanupTestData)();
    });
    describe("GET /users", () => {
        it("should return all users", async () => {
            const response = await (0, supertest_1.default)(app_1.default).get("/users");
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
            const response = await (0, supertest_1.default)(app_1.default).get(`/users/${userId}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("id");
            expect(response.body).toHaveProperty("name");
            expect(response.body).toHaveProperty("email");
        });
        it("should return 404 for non-existent user", async () => {
            const response = await (0, supertest_1.default)(app_1.default).get("/users/9999");
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("message", "User not found");
        });
    });
    describe("POST /users", () => {
        it("should create a new user", async () => {
            const response = await (0, supertest_1.default)(app_1.default).post("/users").send({
                name: "David",
                email: `david+${Date.now()}@example.com`,
            });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("insertId");
        });
        it("should return 400 if name is missing", async () => {
            const response = await (0, supertest_1.default)(app_1.default).post("/users").send({
                email: "test@example.com",
            });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("message");
        });
        it("should return 400 if email is missing", async () => {
            const response = await (0, supertest_1.default)(app_1.default).post("/users").send({
                name: "Test User",
            });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("message");
        });
    });
    describe("PUT /users/:id", () => {
        it("should update a user", async () => {
            const userId = seedDataIds.userIds[0] || 1;
            const response = await (0, supertest_1.default)(app_1.default).put(`/users/${userId}`).send({
                name: "Alice Updated",
                email: `alice.updated+${Date.now()}@example.com`,
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("message", "User updated");
        });
        it("should return 404 for non-existent user", async () => {
            const response = await (0, supertest_1.default)(app_1.default).put("/users/9999").send({
                name: "Non-existent",
                email: "nonexistent@example.com",
            });
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("message", "User not found");
        });
        it("should return 400 if validation fails", async () => {
            const userId = seedDataIds.userIds[0] || 1;
            const response = await (0, supertest_1.default)(app_1.default).put(`/users/${userId}`).send({
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
            const createResponse = await (0, supertest_1.default)(app_1.default).post("/users").send({
                name: "Temp User",
                email: `temp+${Date.now()}@example.com`,
            });
            const userId = createResponse.body.insertId;
            // Then delete it
            const response = await (0, supertest_1.default)(app_1.default).delete(`/users/${userId}`);
            expect(response.status).toBe(204);
        });
        it("should return 404 for non-existent user", async () => {
            const response = await (0, supertest_1.default)(app_1.default).delete("/users/9999");
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("message", "User not found");
        });
    });
});
