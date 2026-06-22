"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../src/app"));
const seed_1 = require("../fixtures/seed");
describe("Task Integration Tests", () => {
    let seedDataIds = {
        taskIds: [],
        projectIds: [],
    };
    beforeAll(async () => {
        await (0, seed_1.seedTestData)();

        const tasksResponse = await (0, supertest_1.default)(app_1.default).get("/tasks");
        if (tasksResponse.body.length >= 3) {
            seedDataIds.taskIds = tasksResponse.body.slice(0, 3).map((t) => t.id);
            seedDataIds.projectIds = [
                ...new Set(tasksResponse.body
                    .slice(0, 3)
                    .map((t) => t.project_id)),
            ];
        }
    });
    afterAll(async () => {
        await (0, seed_1.cleanupTestData)();
    });
    describe("GET /tasks", () => {
        it("should return all tasks", async () => {
            const response = await (0, supertest_1.default)(app_1.default).get("/tasks");
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThanOrEqual(3); 
        });
        it("should filter tasks by project_id", async () => {
            const projectId = seedDataIds.projectIds[0] || 1;
            const response = await (0, supertest_1.default)(app_1.default).get(`/tasks?project_id=${projectId}`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);

            response.body.forEach((task) => {
                expect(task.project_id).toBe(projectId);
            });
        });
    });
    describe("GET /tasks/:id", () => {
        it("should return a task by ID", async () => {
            const taskId = seedDataIds.taskIds[0] || 1;
            const response = await (0, supertest_1.default)(app_1.default).get(`/tasks/${taskId}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("id");
            expect(response.body).toHaveProperty("title");
        });
        it("should return 404 for non-existent task", async () => {
            const response = await (0, supertest_1.default)(app_1.default).get("/tasks/9999");
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("message", "Task not found");
        });
    });
    describe("POST /tasks", () => {
        it("should create a new task", async () => {
            const projectId = seedDataIds.projectIds[0] || 1;
            const response = await (0, supertest_1.default)(app_1.default).post("/tasks").send({
                title: "New Task",
                status: "pending",
                project_id: projectId,
            });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("insertId");
        });
        it("should return 400 if required fields are missing", async () => {
            const response = await (0, supertest_1.default)(app_1.default).post("/tasks").send({
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
            const response = await (0, supertest_1.default)(app_1.default).put(`/tasks/${taskId}`).send({
                title: "Updated Task",
                status: "in-progress",
                project_id: projectId,
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("message", "Task updated");
        });
        it("should return 404 for non-existent task", async () => {
            const projectId = seedDataIds.projectIds[0] || 1;
            const response = await (0, supertest_1.default)(app_1.default).put("/tasks/9999").send({
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
            const projectId = seedDataIds.projectIds[0] || 1;
            const createResponse = await (0, supertest_1.default)(app_1.default).post("/tasks").send({
                title: "Task to Delete",
                status: "pending",
                project_id: projectId,
            });
            const taskId = createResponse.body.insertId;
            const deleteResponse = await (0, supertest_1.default)(app_1.default).delete(`/tasks/${taskId}`);
            expect(deleteResponse.status).toBe(204);
        });
        it("should return 404 for non-existent task", async () => {
            const response = await (0, supertest_1.default)(app_1.default).delete("/tasks/9999");
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("message", "Task not found");
        });
    });
});
