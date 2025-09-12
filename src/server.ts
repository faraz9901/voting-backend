import express from "express";
import { config } from "./config";
import { AppError, errorHandler } from "./utils";


const app = express()

app.get('/', (req, res) => {
    throw new AppError(404, 'Not Found')
})

app.use(errorHandler)

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`)
})

