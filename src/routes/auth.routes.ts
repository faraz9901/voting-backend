import express from "express";
import { register, login } from "../controller/auth.controller";
import { validate } from "../middleware/validate";
import { loginValidation, registerValidation } from "../validations/auth.validation";

const router = express.Router()

router.post('/register', validate(registerValidation), register)

router.post('/login', validate(loginValidation), login)

export default router
