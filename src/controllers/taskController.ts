import { Request, Response } from "express";
import { pool } from "../config/db";

export const createTask = async (req: Request, res: Response) => {
  const { title, status, project_id } = req.body;

  const [result] = await pool.execute(
    "INSERT INTO tasks (title, status, project_id) VALUES (?, ?, ?)",
    [title, status, project_id]
  );

  res.status(201).json(result);
};

export const getTasks = async (req: Request, res: Response) => {
  const { project_id } = req.query;

  let query = "SELECT * FROM tasks";
  let params: any[] = [];

  if (project_id) {
    query += " WHERE project_id = ?";
    params.push(project_id);
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
  
  await pool.execute(
    "UPDATE tasks SET title = ?, status = ?, project_id = ? WHERE id = ?",
    [title, status, project_id, id]
  );
  res.status(200).json({ message: "Task updated" });
};

export const deleteTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  await pool.execute("DELETE FROM tasks WHERE id = ?", [id]);
  res.status(204).send();
};