import { AiModel } from "../Model/aiModel";

const createChat = async () => {
  const result = await AiModel.chatModel();
  return result;
};

export const BotService = {
  createChat,
};
