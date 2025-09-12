import { Request, Response, NextFunction } from "express";

export const register = (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: 'Register' })
}

export const login = (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: 'Login' })
}
