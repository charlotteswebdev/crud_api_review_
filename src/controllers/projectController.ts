import { Request, Response } from "express";
import { pool } from "../config/db";

export const createProject = async (req: Request, res: Response) => {
  const { name, owner_id } = req.body;

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

  await pool.execute(
    "UPDATE projects SET name = ?, owner_id = ? WHERE id = ?",
    [name, owner_id, id]
  );
  
  res.status(200).json({ message: "Project updated" });
};

export const deleteProject = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  await pool.execute("DELETE FROM projects WHERE id = ?", [id]);
  res.status(204).send();
};
  