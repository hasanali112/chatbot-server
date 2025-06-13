import { Router } from "express";
import { BotController } from "./bot.controller";

const router = Router();

router.get("/chat", BotController.createChat);

export const BotRoutes = router;
