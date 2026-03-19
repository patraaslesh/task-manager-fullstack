import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient();

const ACCESS_SECRET = "access123";
const REFRESH_SECRET = "refresh123";

let refreshTokens: string[] = [];

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields required" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashed },
    });

    res.json(user);
  } catch {
    res.status(400).json({ message: "User already exists" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) return res.status(404).json({ message: "User not found" });

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) return res.status(401).json({ message: "Wrong password" });

  const accessToken = jwt.sign({ userId: user.id }, ACCESS_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET);

  refreshTokens.push(refreshToken);

  res.json({ accessToken, refreshToken });
});

// 🔁 REFRESH TOKEN
router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;

  // ❌ No token
  if (!refreshToken)
    return res.status(401).json({ message: "No token" });

  // ❌ Not in stored tokens (optional but good practice)
  if (!refreshTokens.includes(refreshToken))
    return res.status(403).json({ message: "Invalid refresh token" });

  try {
    const decoded: any = jwt.verify(refreshToken, REFRESH_SECRET);

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken });
  } catch {
    res.status(403).json({ message: "Invalid token" });
  }
});

// 🚪 LOGOUT
router.post("/logout", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(400).json({ message: "Token required" });

  refreshTokens = refreshTokens.filter(
    (token) => token !== refreshToken
  );

  res.json({ message: "Logged out successfully" });
});

export default router;