import jwt from "jsonwebtoken";
import { config } from "../config";

const JWT_SECRET = config.jwt // keep secret in .env

// Type for your payload
interface JwtPayload {
    userId: string;
}

// Generate token
export const generateToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
};

// Verify token
export const verifyToken = (token: string): JwtPayload => {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
