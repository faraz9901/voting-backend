import { Request, Response, NextFunction } from 'express';

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
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
};