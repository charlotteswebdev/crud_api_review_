import { Router } from "express";
import { createComment, deleteComment, getComments, getCommentById, updateComment } from "../controllers/commentController";

const router = Router();

router.post("/", createComment);
router.get("/", getComments);
router.get("/:id", getCommentById);
router.delete("/:id", deleteComment);
router.put("/:id", updateComment);


export default router;