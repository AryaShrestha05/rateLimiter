import crypto from 'crypto';
import { Router } from "express";
import pool from '../src/db.js';
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/api/keys", requireAuth, async (req, res) => {
  const apiKey = "rk_" + crypto.randomBytes(24).toString('hex');

  const result = await pool.query(
    `INSERT INTO api_keys (key, user_id)
     VALUES ($1, $2)
     RETURNING id, key, name, bucket_capacity, refill_rate, created_at`,
    [apiKey, req.user.id]
  );

  res.status(201).send(result.rows[0]);
});

router.get("/api/keys", requireAuth, async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM api_keys WHERE user_id = $1`,
    [req.user.id]
  );
  res.status(200).send(result.rows);
});

router.delete("/api/keys/:id", requireAuth, async (req, res) => {
  const result = await pool.query(
    `DELETE FROM api_keys WHERE id = $1 AND user_id = $2`,
    [req.params.id, req.user.id]
  );
  res.status(200).send({ msg: "Key deleted" });
});

router.get("/api/keys/:id", requireAuth, async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM api_keys WHERE id = $1 AND user_id = $2`,
    [req.params.id, req.user.id]
  );
  res.status(200).send(result.rows[0]);
});

export default router;
