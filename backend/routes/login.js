import { Router } from "express";
import { validationResult, checkSchema, matchedData } from "express-validator";
import { loginUserSchema } from "../utils/validationSchemas.js";
import pool from '../src/db.js';
import { hashPassword } from "../utils/helpers.js";
import passport from "passport";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Register a new user
router.post("/api/register", checkSchema(loginUserSchema), async (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty())
    return res.status(400).send(result.array());
  const data = matchedData(req);
  const hashedPassword = hashPassword(data.password);
  const insertResult = await pool.query(
    `INSERT INTO users (name, email, passwords_hash)
     VALUES ($1, $2, $3)
     RETURNING id, email, plan, created_at`,
    [data.name, data.email, hashedPassword]
  );
  res.status(201).send(insertResult.rows[0]);
});

// Login — starts a session
router.post("/api/login", passport.authenticate('local'), (req, res) => {
  res.status(200).send({
    msg: "Login successful",
    user: { id: req.user.id, email: req.user.email, plan: req.user.plan }
  });
});

// Logout — destroys the session
router.post("/api/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).send({ msg: "Logout failed" });
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.status(200).send({ msg: "Logged out" });
    });
  });
});

// Check who's logged in
router.get("/api/me", requireAuth, (req, res) => {
  res.status(200).send({ user: req.user });
});

export default router;
