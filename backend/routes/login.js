import { Router } from "express";
import { validationResult, checkSchema, matchedData } from "express-validator";
import { loginUserSchema } from "../utils/validationSchemas.js";
import pool from '../src/db.js';

const router = Router();

router.post("/api/register", checkSchema(loginUserSchema), (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) 
    return res.status(400).send({ msg: "Invalid Credentials!" });
  const data = matchedData(req);
  res.send(data);
});

export default router;
