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
  console.log(socket);
});

/*const wss = new ws.WebSocketServer({ server });

const sockets: UserSocket[] = [];

wss.on("connection", (socket: UserSocket) => {
  console.log("Connected to Browser ✅");
  socket.nickname = "anonymous";
  sockets.push(socket);

  socket.on("message", (result) => {
    const message: Message = JSON.parse(result.toString());

    switch (message.type) {
      case "nickname":
        socket.nickname = message.payload;
        break;
      case "new_message":
        sockets.forEach((item: UserSocket) =>
          item.send(`${socket.nickname}: ${message.payload}`)
        );
    }
  });

  socket.on("close", () => console.log("Disconnected from Browser ❌"));
});*/

httpServer.listen(3000, () => console.log("3000번 포트 연결 중..."));
