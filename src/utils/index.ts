import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '../generated/prisma';
import jwt from "jsonwebtoken"

export class AppResponse {

    status: number;
    message: string;
    success: boolean;
    content: unknown;

    constructor(
        status: number,
        message: string,
        content: unknown
    ) {
        this.status = status;
        this.message = message;
        this.success = true;
        this.content = content;
    }

    send(res: Response) {
        res.status(this.status).json(this);
    }

}

export class AppError extends Error {
    status: number;
    success: boolean;
    constructor(
        status: number,
        message: string,
    ) {
        super(message);
        this.status = status;
        this.success = false;
    }

}


export const errorHandler = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) => {

    // Zod Validation Errors
    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            message: err.issues[0].message,
        });
    }

    // Prisma Errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        // Common error codes: https://www.prisma.io/docs/reference/api-reference/error-reference
        if (err.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: `Unique constraint failed on: ${err.meta?.target}`,
            });
        }

        if (err.code === "P2025") {
            return res.status(404).json({
                success: false,
                message: "Record not found",
            });
        }

        return res.status(400).json({
            success: false,
            message: `Database error: ${err.message}`,
        });
    }

    if (err instanceof Prisma.PrismaClientValidationError) {
        return res.status(400).json({
            success: false,
            message: "Invalid data provided to database query",
        });
    }

    if (err instanceof Prisma.PrismaClientInitializationError) {
        return res.status(500).json({
            success: false,
            message: "Database initialization error",
        });
    }

    if (err instanceof Prisma.PrismaClientRustPanicError) {
        return res.status(500).json({
            success: false,
            message: "Database encountered an unexpected error",
        });
    }

    // JWT Errors
    if (err instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
            success: false,
            message: "Invalid token",
        });
    }

    if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
            success: false,
            message: "Token expired",
        });
    }

    if (err instanceof jwt.NotBeforeError) {
        return res.status(401).json({
            success: false,
            message: "Token not active yet",
        });
    }

    // Custom AppError
    if (err instanceof AppError) {
        return res.status(err.status || 500).json({
            success: false,
            message: err.message || "Internal Server Error",
        });
    }

    // Native Errors
    if (err instanceof Error) {
        return res.status(500).json({
            success: false,
            message: err.message || "Internal Server Error",
        });
    }

    // Unknown Errors
    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
    });
};
