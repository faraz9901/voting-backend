import dotenv from "dotenv";


dotenv.config();

interface Config {
    port: number;
    jwt: string
}

export const config: Config = {
    port: Number(process.env.PORT) || 7000,
    jwt: String(process.env.JWT_SECRET) || "myUniqueKey"
}


