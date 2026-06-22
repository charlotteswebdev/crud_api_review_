import { Request, Response } from "express";
import { ResultSetHeader } from "mysql2";
import { pool } from "../config/db";

const validateTaskInput = (title: unknown, status: unknown, project_id: unknown): string | null => {
  if (typeof title !== "string" || title.trim() === "") {
    return "title is required and must be a non-empty string";
  }
  if (typeof status !== "string" || status.trim() === "") {
    return "status is required and must be a non-empty string";
  }
  if (project_id === null || project_id === undefined) {
    return "project_id is required";
  }
  if (typeof project_id !== "number" && typeof project_id !== "string") {
    return "project_id must be a number";
  }
  return null;
};

export const createTask = async (req: Request, res: Response) => {
  const { title, status, project_id } = req.body;

  const validationError = validateTaskInput(title, status, project_id);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const [result] = await pool.execute(
    "INSERT INTO tasks (title, status, project_id) VALUES (?, ?, ?)",
    [title, status, project_id]
  );

  res.status(201).json(result);
};

export const getTasks = async (req: Request, res: Response) => {
  const projectId =
    typeof req.query.project_id === "string"
      ? req.query.project_id
      : Array.isArray(req.query.project_id)
        ? req.query.project_id[0]
        : undefined;

  let query = "SELECT * FROM tasks";
  let params: any[] = [];

  if (projectId) {
    query += " WHERE project_id = ?";
    params.push(projectId);
  }

  const [rows] = await pool.execute(query, params);
  res.json(rows);
};

export const getTaskById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const [rows]: any = await pool.execute("SELECT * FROM tasks WHERE id = ?", [id]);

  if (rows.length === 0) {
    return res.status(404).json({ message: "Task not found" });
  }

  res.json(rows[0]);
};

export const updateTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, status, project_id } = req.body;

  const validationError = validateTaskInput(title, status, project_id);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }
  
  const [result] = await pool.execute<ResultSetHeader>(
    "UPDATE tasks SET title = ?, status = ?, project_id = ? WHERE id = ?",
    [title, status, project_id, id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: "Task not found" });
  }

  res.status(200).json({ message: "Task updated" });
};

export const deleteTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const [result] = await pool.execute<ResultSetHeader>("DELETE FROM tasks WHERE id = ?", [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: "Task not found" });
  }

  res.status(204).send();
};