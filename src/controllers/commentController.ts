import { Request, Response } from "express";
import { pool } from "../config/db";

export const createComment = async (req: Request, res: Response) => {
  const { content, task_id, user_id } = req.body;

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
  
  await pool.execute(
    "UPDATE comments SET content = ?, task_id = ?, user_id = ? WHERE id = ?",
    [content, task_id, user_id, id]
  );
  res.status(200).json({ message: "Comment updated" });
};

export const deleteComment = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  await pool.execute("DELETE FROM comments WHERE id = ?", [id]);
  res.status(204).send();
};
