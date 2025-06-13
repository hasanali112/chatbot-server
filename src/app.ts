import express, { Application, Request, Response } from "express";
import cors from "cors";
import { BotRoutes } from "./app/module/Bot/bot.routes";

const app: Application = express();

app.use(express.json());
app.use(cors());

app.use("/api", BotRoutes);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Chat bot server is running",
  });
});

export default app;
