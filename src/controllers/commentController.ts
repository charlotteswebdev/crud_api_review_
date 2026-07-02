import { Request, Response } from "express";
import { ResultSetHeader } from "mysql2";
import { pool } from "../config/db";

const validateCommentInput = (content: unknown, task_id: unknown, user_id: unknown): string | null => {
  if (typeof content !== "string" || content.trim() === "") {
    return "content is required and must be a non-empty string";
  }
  if (task_id === null || task_id === undefined) {
    return "task_id is required";
  }
  if (typeof task_id !== "number" && typeof task_id !== "string") {
    return "task_id must be a number";
  }
  if (user_id === null || user_id === undefined) {
    return "user_id is required";
  }
  if (typeof user_id !== "number" && typeof user_id !== "string") {
    return "user_id must be a number";
  }
  return null;
};

export const createComment = async (req: Request, res: Response) => {
  const { content, task_id, user_id } = req.body;

  const validationError = validateCommentInput(content, task_id, user_id);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

    const [result] = await pool.execute(
        "INSERT INTO comments (content, task_id, user_id) VALUES (?, ?, ?)",
        [content, task_id, user_id]
    );

    res.status(201).json(result);
};

export const getComments = async (_: Request, res: Response) => {
  const [rows] = await pool.execute(`
    SELECT 
      comments.*, 
      users.name AS user_name,
      tasks.title AS task_title
    FROM comments
    JOIN users ON comments.user_id = users.id
    JOIN tasks ON comments.task_id = tasks.id
  `);

  res.json(rows);
};


export const getCommentById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const [rows]: any = await pool.execute(
    `
    SELECT 
      comments.*, 
      users.name AS user_name,
      tasks.title AS task_title
    FROM comments
    JOIN users ON comments.user_id = users.id
    JOIN tasks ON comments.task_id = tasks.id
    WHERE comments.id = ?
    `,
    [id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: "Comment not found" });
  }

  res.json(rows[0]); 
};

export const updateComment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content, task_id, user_id } = req.body;

  const validationError = validateCommentInput(content, task_id, user_id);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }
  
  const [result] = await pool.execute<ResultSetHeader>(
    "UPDATE comments SET content = ?, task_id = ?, user_id = ? WHERE id = ?",
    [content, task_id, user_id, id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: "Comment not found" });
  }

  res.status(200).json({ message: "Comment updated" });
};

export const deleteComment = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const [result] = await pool.execute<ResultSetHeader>("DELETE FROM comments WHERE id = ?", [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: "Comment not found" });
  }

  res.status(204).send();
};
