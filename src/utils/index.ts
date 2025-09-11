import { Response } from "express";

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