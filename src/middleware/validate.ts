import { NextFunction, Request, Response } from "express";
import { z } from "zod"

export const validate = (schema: z.ZodType) => {

    return async (req: Request, res: Response, next: NextFunction) => {

        try {
            const result = await schema.parseAsync(req.body)

            req.body = result
            next()
        } catch (error) {
            next(error)

        }

    }

}


