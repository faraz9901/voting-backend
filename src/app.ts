import express from "express";
import { Server } from "socket.io";
import http from "http";
import { AppError, errorHandler } from "./utils";
import authRoutes from "./routes/auth.routes";
import pollRoutes from "./routes/poll.routes";
import cookieParser from "cookie-parser";
import cors from "cors"



const app = express()

app.use(cors());

app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/polls', pollRoutes)



app.use(errorHandler)


const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

io.on("connection", (socket) => {
    console.log("a user connected:", socket.id);


    socket.on("joinPoll", (pollId) => {
        socket.join(`poll-${pollId}`);
        console.log(`User ${socket.id} joined poll-${pollId}`);
    });


    socket.on("disconnect", () => {
        console.log("user disconnected:", socket.id);
    });
});

export { io, server }
