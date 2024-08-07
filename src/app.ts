import express, { Response } from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import { UserSocket } from "./types";

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

instrument(wsServer, {
  auth: false,
});

function getUserCount() {
  return wsServer.sockets.adapter.sids.size;
}

function getRoomCount() {
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

function getRoomUserCount(roomName: string) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket: UserSocket) => {
  socket.onAny((e) => console.log(`소켓 이벤트: ${e}`));

  wsServer.sockets.emit("user_change", getUserCount());
  wsServer.sockets.emit("room_change", getRoomCount());

  socket.nickname = "익명";

  socket.on("nickname", (nickname: string, done: () => void) => {
    if (nickname !== "") {
      socket.nickname = nickname;

      done();
    }
  });

  socket.on(
    "enter_room",
    (roomName: string, done: (roomName: string) => void) => {
      socket.join(roomName);

      // to 방에서 나를 제외한 모두에게
      socket.to(roomName).emit("welcome", socket.nickname);
      // to 방에서 나 포함 모두에게
      wsServer
        .to(roomName)
        .emit("room_user_change", getRoomUserCount(roomName));
      // to 모두에게
      wsServer.sockets.emit("room_change", getRoomCount());

      done(roomName);
    }
  );

  socket.on(
    "new_message",
    (roomName: string, msg: string, done: (msg: string) => void) => {
      socket.to(roomName).emit("new_message", socket.nickname, msg);

      done(`당신: ${msg}`);
    }
  );

  socket.on("exit_room", (roomName: string, done: () => void) => {
    socket.leave(roomName);

    socket.to(roomName).emit("bye", socket.nickname);
    socket.to(roomName).emit("room_user_change", getRoomUserCount(roomName));
    wsServer.sockets.emit("room_change", getRoomCount());

    done();
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((roomName) => {
      socket.to(roomName).emit("bye", socket.nickname);
      socket.to(roomName).emit("room_user_change", getRoomUserCount(roomName));
    });
  });

  socket.on("disconnect", () => {
    wsServer.sockets.emit("user_change", getUserCount());
  });
});

httpServer.listen(3000, () => console.log("3000번 포트 연결 중..."));
