import { Router } from "express";
import { createUser, getUserById, getUsers, deleteUser, updateUser } from "../controllers/userController";
const router = Router();

router.post("/", createUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.delete("/:id", deleteUser);
router.put("/:id", updateUser);

export default router;