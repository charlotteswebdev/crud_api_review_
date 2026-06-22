import { Request, Response } from "express";
import { ResultSetHeader } from "mysql2";
import { pool } from "../config/db";

const validateUserInput = (name: unknown, email: unknown): string | null => {
  if (typeof name !== "string" || name.trim() === "") {
    return "name is required and must be a non-empty string";
  }
  if (typeof email !== "string" || email.trim() === "") {
    return "email is required and must be a non-empty string";
  }
  return null;
};

export const createUser = async (req: Request, res: Response) => {
  const { name, email } = req.body;

  const validationError = validateUserInput(name, email);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

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

  const validationError = validateUserInput(name, email);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }
  
  const [result] = await pool.execute<ResultSetHeader>(
    "UPDATE users SET name = ?, email = ? WHERE id = ?",
    [name, email, id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({ message: "User updated" });
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const [result] = await pool.execute<ResultSetHeader>("DELETE FROM users WHERE id = ?", [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(204).send();
};