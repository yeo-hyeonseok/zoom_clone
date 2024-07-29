import { Socket } from "dgram";
import express, { Request, Response } from "express";
import http from "http";
import path from "path";
import ws, { WebSocket } from "ws";

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req: Request, res: Response) => {
  res.render("home");
});

app.get("/*", (req: Request, res: Response) => res.redirect("/"));

const server = http.createServer(app);
const wss = new ws.WebSocketServer({ server });

const sockets: WebSocket[] = [];

wss.on("connection", (socket) => {
  console.log("Connected to Browser ✅");
  sockets.push(socket);

  socket.on("message", (message) => {
    sockets.forEach((item) => item.send(message.toString()));
  });

  socket.on("close", () => console.log("Disconnected from Browser ❌"));

  socket.send("Welcome to ANZOOM");
});

server.listen(3000, () => console.log("3000번 포트 연결 중..."));
