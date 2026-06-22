import { Request, Response } from "express";
import { pool } from "../config/db";

export const createUser = async (req: Request, res: Response) => {
  const { name, email } = req.body;

  const [result] = await pool.execute(
    "INSERT INTO users (name, email) VALUES (?, ?)",
    [name, email]
  );

  res.status(201).json(result);
};

export const getUsers = async (_: Request, res: Response) => {
  const [rows] = await pool.execute("SELECT * FROM users");
  res.json(rows);
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const [rows]: any = await pool.execute("SELECT * FROM users WHERE id = ?", [id]);

  if (rows.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(rows[0]);
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email } = req.body;
  
  await pool.execute(
    "UPDATE users SET name = ?, email = ? WHERE id = ?",
    [name, email, id]
  );
  res.status(200).json({ message: "User updated" });
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  await pool.execute("DELETE FROM users WHERE id = ?", [id]);
  res.status(204).send();
};