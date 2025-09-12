import express from "express";
import { config } from "./config";
import { AppError, errorHandler } from "./utils";
import authRoutes from "./routes/auth.routes";

const app = express()

app.use('/api/auth', authRoutes)


app.get('/', (req, res) => {
    throw new AppError(404, 'Not Found')
})

app.use(errorHandler)

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`)
})

