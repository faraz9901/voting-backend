import express from "express";
import { register, login } from "../controller/auth.controller";
import { validate } from "../middleware/validate";
import { registerValidation } from "../validations/auth.validation";

const router = express.Router()

router.post('/register', validate(registerValidation), register)

router.post('/login', login)

export default router
