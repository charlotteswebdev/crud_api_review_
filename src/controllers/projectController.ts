import { Request, Response } from "express";
import { ResultSetHeader } from "mysql2";
import { pool } from "../config/db";

const validateProjectInput = (name: unknown, owner_id: unknown): string | null => {
  if (typeof name !== "string" || name.trim() === "") {
    return "name is required and must be a non-empty string";
  }
  if (owner_id === null || owner_id === undefined) {
    return "owner_id is required";
  }
  if (typeof owner_id !== "number" && typeof owner_id !== "string") {
    return "owner_id must be a number";
  }
  return null;
};

export const createProject = async (req: Request, res: Response) => {
  const { name, owner_id } = req.body;

  const validationError = validateProjectInput(name, owner_id);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const [result] = await pool.execute(
    "INSERT INTO projects (name, owner_id) VALUES (?, ?)",
    [name, owner_id]
  );

  res.status(201).json(result);
};

export const getProjects = async (_: Request, res: Response) => {
  const [rows] = await pool.execute(`
    SELECT projects.*, users.name AS owner_name
    FROM projects
    JOIN users ON projects.owner_id = users.id
  `);

  res.json(rows);
};

export const getProjectById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const [rows]: any = await pool.execute(`
    SELECT projects.*, users.name AS owner_name
    FROM projects
    JOIN users ON projects.owner_id = users.id
    WHERE projects.id = ?
  `, [id]);

  if (rows.length === 0) {
    return res.status(404).json({ message: "Project not found" });
  }
  
  res.json(rows[0]);
};

export const updateProject = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, owner_id } = req.body;

  const validationError = validateProjectInput(name, owner_id);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const [result] = await pool.execute<ResultSetHeader>(
    "UPDATE projects SET name = ?, owner_id = ? WHERE id = ?",
    [name, owner_id, id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: "Project not found" });
  }
  
  res.status(200).json({ message: "Project updated" });
};

export const deleteProject = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const [result] = await pool.execute<ResultSetHeader>("DELETE FROM projects WHERE id = ?", [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: "Project not found" });
  }

  res.status(204).send();
};
  