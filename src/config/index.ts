import dotenv from "dotenv";


dotenv.config();

export enum ENV {
    DEVELOPMENT = "development",
    PRODUCTION = "production"
}

interface Config {
    port: number;
    jwt: string
    env: ENV
}

export const config: Config = {
    port: Number(process.env.PORT) || 7000,
    jwt: String(process.env.JWT_SECRET) || "myUniqueKey",
    env: process.env.NODE_ENV as ENV || ENV.DEVELOPMENT
}


