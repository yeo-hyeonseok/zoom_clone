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

// 아래의 코드를 작성하지 않는다고 브라우저와 연결이 성립하지 않는 건 아님 => 그저 이벤트를 기다리는 것 뿐
wss.on("connection", (socket) => {
  console.log("Connected to Browser ✅");

  // 브라우저로부터 메시지를 받았을 때의 이벤트 핸들러
  socket.on("message", (message) =>
    console.log(`Browser: ${message.toString()}`)
  );

  // 브라우저와의 연결이 종료되었을 때의 이벤트 핸들러
  socket.on("close", () => console.log("Disconnected from Browser ❌"));

  // 브라우저한테 메시지를 보내고 싶다면 'send'
  socket.send("Welcome to ANZOOM");
});

server.listen(3000, () => console.log("3000번 포트 연결 중..."));
