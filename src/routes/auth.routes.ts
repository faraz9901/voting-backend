import express from "express";
import { register, login, logout, getCurrentUser } from "../controller/auth.controller";
import { validate } from "../middleware/validate";
import { loginValidation, registerValidation } from "../validations/auth.validation";
import { verifyToken } from "../middleware/verifyToken";


const router = express.Router()

router.post('/register', validate(registerValidation), register)
router.post('/login', validate(loginValidation), login)
router.post('/logout', logout)

router.get('/me', verifyToken, getCurrentUser)

export default router
