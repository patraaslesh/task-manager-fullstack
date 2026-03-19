import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient();

const SECRET = "access123";

// 🔐 AUTH MIDDLEWARE
const auth = (req: any, res: any, next: any) => {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded: any = jwt.verify(token, SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// ✅ CREATE TASK
router.post("/", auth, async (req: any, res) => {
  try {
    const { title } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Title required" });
    }

    const task = await prisma.task.create({
      data: {
        title,
        userId: req.userId,
      },
    });

    res.json(task);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET TASKS (SEARCH + FILTER + PAGINATION)
router.get("/", auth, async (req: any, res) => {
  try {
    const { page = 1, search = "", completed } = req.query;

    const take = 5;
    const skip = (Number(page) - 1) * take;

    const tasks = await prisma.task.findMany({
      where: {
        userId: req.userId,
        title: {
          contains: String(search),
        },
        completed:
          completed !== undefined
            ? completed === "true"
            : undefined,
      },
      take,
      skip,
    });

    res.json(tasks);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ UPDATE TASK (WITH OWNERSHIP CHECK)
router.patch("/:id", auth, async (req: any, res) => {
  try {
    const id = Number(req.params.id);
    const { title } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Title required" });
    }

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task)
      return res.status(404).json({ message: "Task not found" });

    if (task.userId !== req.userId)
      return res.status(403).json({ message: "Unauthorized" });

    const updated = await prisma.task.update({
      where: { id },
      data: { title },
    });

    res.json(updated);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ TOGGLE TASK (WITH OWNERSHIP CHECK)
router.patch("/:id/toggle", auth, async (req: any, res) => {
  try {
    const id = Number(req.params.id);

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task)
      return res.status(404).json({ message: "Task not found" });

    if (task.userId !== req.userId)
      return res.status(403).json({ message: "Unauthorized" });

    const updated = await prisma.task.update({
      where: { id },
      data: { completed: !task.completed },
    });

    res.json(updated);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ DELETE TASK (WITH OWNERSHIP CHECK)
router.delete("/:id", auth, async (req: any, res) => {
  try {
    const id = Number(req.params.id);

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task)
      return res.status(404).json({ message: "Task not found" });

    if (task.userId !== req.userId)
      return res.status(403).json({ message: "Unauthorized" });

    await prisma.task.delete({
      where: { id },
    });

    res.json({ message: "Deleted successfully" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;