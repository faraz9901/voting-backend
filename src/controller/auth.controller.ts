import { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/prisma";
import argon2 from "argon2"
import { AppError, AppResponse } from "../utils";
import { generateToken } from "../utils/jwt";


export const register = async (req: Request, res: Response, next: NextFunction) => {

    // This body is validated by validate middleware
    const { name, email, password } = req.body

    // to check if the user already exist
    const user = await prisma.user.findUnique({
        where: {
            email
        }
    })

    // if the user exist throw this error
    if (user) {
        throw new AppError(400, 'User already exists')
    }

    // hashing the password
    const hashedPassword = await argon2.hash(password)

    // creating a new user 
    const newUser = await prisma.user.create({
        data: {
            name,
            email,
            passwordHash: hashedPassword
        }
    })

    // dont send password to the client
    const authUser = { ...newUser, passwordHash: "" }

    // returning the response
    return new AppResponse(201, 'User created successfully', authUser).send(res)

}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    // This body is validated by validate middleware
    const { email, password } = req.body

    // checking if the user is exist 
    const user = await prisma.user.findUnique({
        where: {
            email
        }
    })

    // if user not found
    if (!user) {
        throw new AppError(400, 'User not found')
    }

    // verifying the password 
    const isPasswordValid = argon2.verify(user.passwordHash, password)

    // if password was incorrect 
    if (!isPasswordValid) {
        throw new AppError(400, 'Invalid credentials')
    }

    // generate jwt token
    const token = generateToken({
        userId: user.id
    })

    // saving the jwt token in cookie
    res.cookie('token', token, {
        httpOnly: false,
        secure: false,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000
    })

    // dont send passsword to the client
    const authUser = { ...user, passwordHash: "" }

    // returning the response
    return new AppResponse(200, 'Login successful', authUser).send(res)
}
