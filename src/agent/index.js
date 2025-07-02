import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatGroq } from "@langchain/groq";
import dotenv from "dotenv";
import { tool } from "@langchain/core/tools";
import { MemorySaver } from "@langchain/langgraph";
import { z } from "zod";
import chatbot from "./bot.js";

dotenv.config();

//make tools for extract data from mongodb and here server link https://mobile-server-pi.vercel.app/api/v1/product

const fetchAllProductsTool = tool(
  async () => {
    try {
      const response = await fetch(
        "https://mobile-server-pi.vercel.app/api/v1/product"
      );
      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const { data } = await response.json();
      if (!data?.length) return "NO_PRODUCTS_FOUND";

      // Format: "NAME|PRICE" (one product per line)
      const products = data
        .map(
          (p) => `${p.productName}|${p.variants?.[0]?.sellingPrice || "N/A"}`
        )
        .join("\n");

      return `AVAILABLE_PRODUCTS:\n${products}`;
    } catch (error) {
      return `ERROR: ${error.message}`;
    }
  },
  {
    name: "get_all_products_with_prices",
    description: `
      Fetches ALL products with prices in EXACT format:
      "AVAILABLE_PRODUCTS:
      Product1|Price1
      Product2|Price2"
      The LLM MUST analyze these to find cheapest/most expensive.
      Returns "NO_PRODUCTS_FOUND" if empty.
    `,
    schema: z.object({}).describe("No parameters needed"),
  }
);

const chatbotTool = tool(
  async ({ message }) => {
    return chatbot(message);
  },
  {
    name: "general_chatbot",
    description: "Use for general conversation, greetings, and questions.",
    schema: z.object({
      message: z.string().describe("The user's message to the chatbot."),
    }),
  }
);

const model = new ChatGroq({
  model: "llama3-8b-8192",
  groqApiKey: process.env.GROQ_API_KEY,
});

const checkpointSaver = new MemorySaver();

export const agent = createReactAgent({
  llm: model,
  tools: [fetchAllProductsTool, chatbotTool],
  checkpointSaver,
  systemMessage: `
    You are a helpful assistant. For product price-related questions, use the 'get_all_products_with_prices' tool. For all other general conversation, use the 'general_chatbot' tool.
    1. For pricing questions, ALWAYS use get_all_products_with_prices first.
    2. Parse the "NAME|PRICE" data to find requested info.
    3. For "NO_PRODUCTS_FOUND", respond accordingly.
    4. NEVER guess prices or availability.
    5. For general conversation, use the general_chatbot.
  `,
});
