import express, { Request, Response } from "express";
import path from "path";

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req: Request, res: Response) => {
  res.render("home");
});

app.listen(3000, () => console.log("3000번 포트 연결 중..."));
