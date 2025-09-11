import express from "express";
import { config } from "./config";
import { AppResponse } from "./utils";

const app = express()

app.get('/', (req, res) => {
    new AppResponse(200, 'Success', 'Hello World!').send(res);
})

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`)
})