import { pool } from "../../src/config/db";
import { randomBytes } from "crypto";

// Generate a unique identifier for this test run
const testId = randomBytes(8).toString("hex");

export const seedTestData = async () => {
  try {
    await pool.execute("SET FOREIGN_KEY_CHECKS=0");
    await pool.execute("TRUNCATE TABLE comments");
    await pool.execute("TRUNCATE TABLE tasks");
    await pool.execute("TRUNCATE TABLE projects");
    await pool.execute("TRUNCATE TABLE users");
    await pool.execute("SET FOREIGN_KEY_CHECKS=1");

    const userInserts = [
      ["Alice", `alice+${testId}@test.com`],
      ["Bob", `bob+${testId}@test.com`],
      ["Charlie", `charlie+${testId}@test.com`],
    ];

    const userIds: number[] = [];
    for (const [name, email] of userInserts) {
      const [result] = await pool.execute(
        "INSERT INTO users (name, email) VALUES (?, ?)",
        [name, email]
      ) as any;
      userIds.push(result.insertId);
    }

    const projectInserts = [
      ["Project Alpha", userIds[0]],
      ["Project Beta", userIds[1]],
    ];

    const projectIds: number[] = [];
    for (const [name, owner_id] of projectInserts) {
      const [result] = await pool.execute(
        "INSERT INTO projects (name, owner_id) VALUES (?, ?)",
        [name, owner_id]
      ) as any;
      projectIds.push(result.insertId);
    }

    const taskInserts = [
      ["Task 1", "pending", projectIds[0]],
      ["Task 2", "in-progress", projectIds[0]],
      ["Task 3", "completed", projectIds[1]],
    ];

    const taskIds: number[] = [];
    for (const [title, status, project_id] of taskInserts) {
      const [result] = await pool.execute(
        "INSERT INTO tasks (title, status, project_id) VALUES (?, ?, ?)",
        [title, status, project_id]
      ) as any;
      taskIds.push(result.insertId);
    }

    const commentInserts = [
      ["Comment 1", taskIds[0], userIds[0]],
      ["Comment 2", taskIds[0], userIds[1]],
      ["Comment 3", taskIds[1], userIds[2]],
    ];

    for (const [content, task_id, user_id] of commentInserts) {
      await pool.execute(
        "INSERT INTO comments (content, task_id, user_id) VALUES (?, ?, ?)",
        [content, task_id, user_id]
      );
    }

    console.log("Test data seeded successfully");
  } catch (error) {
    console.error("Error seeding test data:", error);
    throw error;
  }
};

export const cleanupTestData = async () => {
  try {
    await pool.execute("SET FOREIGN_KEY_CHECKS=0");
    await pool.execute("TRUNCATE TABLE comments");
    await pool.execute("TRUNCATE TABLE tasks");
    await pool.execute("TRUNCATE TABLE projects");
    await pool.execute("TRUNCATE TABLE users");
    await pool.execute("SET FOREIGN_KEY_CHECKS=1");
    console.log("Test data cleaned up");
  } catch (error) {
    console.error("Error cleaning up test data:", error);
  }
};
