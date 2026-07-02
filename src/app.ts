import express from "express";
import userRoutes from "./routes/userRoutes";
import projectRoutes from "./routes/projectRoutes";
import taskRoutes from "./routes/taskRoutes";
import commentRoutes from "./routes/commentRoutes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
app.use(express.json());
app.use("/users", userRoutes);
app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);
app.use("/comments", commentRoutes);
app.use(errorHandler);

export default app;