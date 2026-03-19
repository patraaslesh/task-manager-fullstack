import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import taskRoutes from "./routes/tasks";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});