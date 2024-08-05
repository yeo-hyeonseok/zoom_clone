import express, { Response } from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import { UserSocket } from "./types";

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (_, res: Response) => res.render("home"));

app.get("/*", (_, res: Response) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);

function getRoomCount() {
  // adapter는 서로 다른 서버 간의 실시간 통신을 도와주는 장치
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms: string[] = [];

  rooms.forEach((_, key) => {
    if (!sids.get(key)) publicRooms.push(key);
  });

  return publicRooms.length;
}

wsServer.on("connection", (socket: UserSocket) => {
  socket.onAny((e) => console.log(`소켓 이벤트: ${e}`));

  wsServer.sockets.emit("room_change", getRoomCount());
  socket.nickname = "익명";

  socket.on("nickname", (nickname, done) => {
    if (nickname !== "") {
      socket.nickname = nickname;
      done();
    }
  });

  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done(roomName);
    // 룸에서 나를 제외한 모든 소켓에 welcome 이벤트 발생시키기
    socket.to(roomName).emit("welcome", socket.nickname);
    // 모든 소켓에 이벤트 발생
    wsServer.sockets.emit("room_change", getRoomCount());
  });

  socket.on("new_message", (roomName, msg, done) => {
    socket.to(roomName).emit("new_message", socket.nickname, msg);
    done(`당신: ${msg}`);
  });

  // 연결이 완전히 끊어지기 전의 상태, disconnect하고는 다른 거임
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname)
    );
  });
});

httpServer.listen(3000, () => console.log("3000번 포트 연결 중..."));
