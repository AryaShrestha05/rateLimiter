import { Router} from "express";
import { validationResult, checkSchema, matchedData } from "express-validator";
import { loginUserSchema } from "../utils/validationResult.js";


const router = Router()

app.post("/api/login", checkSchema(loginUserSchema), (req,res) => {
  const result = validationResult(req);
  if(result.isEmpty()) return res.sendStatus(400).send({msg: "Invalid Credintials!"});
  
});