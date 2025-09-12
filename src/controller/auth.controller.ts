import { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/prisma";
import argon2 from "argon2"
import { AppError, AppResponse } from "../utils";

export const register = async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
        throw new AppError(400, 'All fields are required')
    }

    const user = await prisma.user.findUnique({
        where: {
            email
        }
    })

    if (user) {
        throw new AppError(400, 'User already exists')
    }

    const hashedPassword = await argon2.hash(password)

    const newUser = await prisma.user.create({
        data: {
            name,
            email,
            passwordHash: hashedPassword
        }
    })

    const authUser = { ...newUser, passwordHash: "" }

    return new AppResponse(201, 'User created successfully', authUser).send(res)

}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body

    if (!email || !password) {
        throw new AppError(400, 'All fields are required')
    }

    const user = await prisma.user.findUnique({
        where: {
            email
        }
    })

    if (!user) {
        throw new AppError(400, 'User not found')
    }

    const isPasswordValid = argon2.verify(user.passwordHash, password)

    if (!isPasswordValid) {
        throw new AppError(400, 'Invalid credentials')
    }

    res.cookie('token', user.id, {
        httpOnly: false,
        secure: false,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000
    })


    const authUser = { ...user, passwordHash: "" }

    return new AppResponse(200, 'Login successful', authUser).send(res)
}
