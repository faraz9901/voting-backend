import { NextFunction, Request, Response } from "express";
import { AppError, AppRequest } from "../utils";
import { verifyToken as verifyJwt } from "../utils/jwt"

export const verifyToken = async (req: AppRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.token

        // if token not found
        if (!token) {
            throw new AppError(401, "Session expired")
        }

        // verifying the token with jwt if not throw a error
        const decodedToken = verifyJwt(token)

        // add userId in request obj for further operations
        req.userId = decodedToken.userId

        next()

    } catch (error) {
        throw new AppError(401, "Session Expired")
    }
}