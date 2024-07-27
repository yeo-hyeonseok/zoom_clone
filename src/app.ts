import express, { Request, Response } from "express";
import http from "http";
import path from "path";
import ws from "ws";

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

// 특정 이벤트가 발생하는 것을 기다렸다가, 이벤트가 발생하면 콜백함수 실행시켜주는 거임
wss.on("connection", (socket) => {
  // 여기서 socket이 의미하는 것은 연결된 대상(브라우저) 또는 연결된 대상과의 연락 라인
  console.log(socket);
});

server.listen(3000, () => console.log("3000번 포트 연결 중..."));
