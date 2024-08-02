import express, { Request, Response } from "express";
import http from "http";
import path from "path";
import { Server, Socket } from "socket.io";
import { Message, UserSocket } from "./types";

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req: Request, res: Response) => {
  res.render("home");
});

app.get("/*", (req: Request, res: Response) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);

wsServer.on("connection", (socket: Socket) => {
  // 소켓의 모든 이벤트를 감지
  socket.onAny((e) => console.log(`소켓 이벤트: ${e}`));

  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done(roomName);
    // 룸에서 나를 제외한 모든 소켓에 welcome 이벤트 발생시키기
    socket.to(roomName).emit("welcome");
  });
});

httpServer.listen(3000, () => console.log("3000번 포트 연결 중..."));
