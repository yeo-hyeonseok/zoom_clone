import express, { Response } from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";

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

httpServer.listen(3000, () => console.log("3000번 포트 연결 중..."));
