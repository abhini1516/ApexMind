import { Request, Response, NextFunction, Express } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const TOKEN_EXPIRY = "7d";

// =======================
// Middleware
// =======================
export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// =======================
// Routes
// =======================
export function registerAuthRoutes(app: Express) {
  // REGISTER
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existing.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email,
        firstName,
        lastName,
        password: hashedPassword,
        profileImageUrl: null,
      })
      .returning();

    res.json({ message: "User registered successfully" });
  });

  // LOGIN
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    res.json({ token });
  });

  // GET CURRENT USER
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user.id));

    res.json(user);
  });
}
