import express, { Response } from "express";
import http from "http";
import path from "path";
import { Server, Socket } from "socket.io";

const app = express();

/* Configuration */
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "/public")));

/* Routing */
app.get("/", (_, res: Response) => res.render("home"));

app.get("/*", (_, res: Response) => res.redirect("/"));

/* Socket.IO */
const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

wsServer.on("connection", (socket: Socket) => {
  socket.onAny((e) => console.log(`소켓 이벤트: ${e}`));

  socket.on("enter_room", (roomName: string) => {
    socket.join(roomName);

    socket.to(roomName).emit("welcome");
  });

  socket.on("offer", (offer: RTCSessionDescriptionInit, roomName: string) => {
    socket.to(roomName).emit("offer", offer);
  });

  socket.on("answer", (answer: RTCSessionDescriptionInit, roomName: string) => {
    socket.to(roomName).emit("answer", answer);
  });
});

httpServer.listen(3000, () => console.log("3000번 포트 연결 중..."));
