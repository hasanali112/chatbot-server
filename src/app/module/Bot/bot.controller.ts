import { Request, Response } from "express";
import { BotService } from "./bot.service";

const createChat = async (req: Request, res: Response) => {
  try {
    const result = await BotService.createChat();
    res.status(200).json({
      statusCode: 200,
      message: "Chat created successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Chat not created",
      data: error,
    });
  }
};

export const BotController = {
  createChat,
};
