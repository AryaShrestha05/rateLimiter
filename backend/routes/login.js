import { Router } from "express";
import { validationResult, checkSchema, matchedData } from "express-validator";
import { loginUserSchema } from "../utils/validationSchemas.js";
import pool from '../src/db.js';

const router = Router();

router.post("/api/register", checkSchema(loginUserSchema), async (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) 
    return res.status(400).send(result.array());
  const data = matchedData(req);
  const insertResult = await pool.query(
    `INSERT INTO users (email, passwords_hash)
     VALUES ($1, $2)
     RETURNING id, email, plan, created_at`,
    [data.email, data.password]
  );

  res.status(201).send(insertResult.rows[0]);
});

export default router;
