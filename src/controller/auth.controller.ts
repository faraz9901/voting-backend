import { Request, NextFunction, Response } from "express";
import { prisma } from "../utils/prisma";
import argon2 from "argon2"
import { AppError, AppRequest, AppResponse, } from "../utils";
import { generateToken } from "../utils/jwt";
import { config, ENV } from "../config";


export const register = async (req: Request, res: Response, next: NextFunction) => {

    // This body is validated by validate middleware
    const { name, email, password } = req.body

    // to check if the user already exist
    const user = await prisma.user.findUnique({
        where: {
            email
        }
    })

    // if the user exist 
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
        httpOnly: true,
        secure: config.env === ENV.PRODUCTION, // True in production
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
    })

    // dont send passsword to the client
    const authUser = { ...user, passwordHash: "" }

    // returning the response
    return new AppResponse(200, 'Login successful', authUser).send(res)
}


export const logout = async (req: Request, res: Response) => {
    res.clearCookie("token")
    return new AppResponse(200, "Logout Successful").send(res)
}

export const getCurrentUser = async (req: AppRequest, res: Response) => {
    // getting the userId from the request
    const userId = req.userId

    // if userId not found
    if (!userId) {
        throw new AppError(401, "No User found")
    }

    // fetching the user from prisma 
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });

    // if there is no user in prisma
    if (!user) {
        throw new AppError(401, "No User found")
    }

    // Password should not be sent to client
    const authUser = { ...user, passwordHash: "" }

    // Sending the user data
    return new AppResponse(200, "User found", authUser).send(res)
}