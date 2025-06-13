import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import config from "../../config";
import {
  START,
  END,
  MessagesAnnotation,
  StateGraph,
  MemorySaver,
  Annotation,
} from "@langchain/langgraph";
import { v4 as uuidv4 } from "uuid";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
  trimMessages,
} from "@langchain/core/messages";

const GraphAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  language: Annotation<string>(),
});

// Wrap your chat function with traceable
const chatModel = async () => {
  try {
    const configId = { configurable: { thread_id: uuidv4() } };

    const llm = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      temperature: 0.3,
      apiKey: config.google_api_key,
    });

    const promptTemplate = ChatPromptTemplate.fromMessages([
      [
        "system",
        "You are a helpful assistant. Answer all questions to the best of your ability in {language}.",
      ],
      ["placeholder", "{messages}"],
    ]);

    const trimmer = trimMessages({
      maxTokens: 50,
      strategy: "last",
      tokenCounter: (msgs) => msgs.length,
      includeSystem: true,
      allowPartial: false,
      startOn: "system",
    });

    const messages = [
      new SystemMessage("you're a good assistant"),
      new HumanMessage("hi! I'm bob"),
      new AIMessage("hi!"),
      new HumanMessage("I like vanilla ice cream"),
      new AIMessage("nice"),
      new HumanMessage("whats 2 + 2"),
      new AIMessage("4"),
      new HumanMessage("thanks"),
      new AIMessage("no problem!"),
      new HumanMessage("having fun?"),
      new AIMessage("yes!"),
    ];

    const callModel = async (state: typeof GraphAnnotation.State) => {
      const trimmedMessage = await trimmer.invoke(state.messages);
      const prompt = await promptTemplate.invoke({
        messages: trimmedMessage,
        language: state.language,
      });
      const response = await llm.invoke(prompt);

      return { messages: [response] };
    };

    const workflow = new StateGraph(GraphAnnotation)
      // Define the node and edge
      .addNode("model", callModel)
      .addEdge(START, "model")
      .addEdge("model", END);

    const memory = new MemorySaver();
    const app = workflow.compile({ checkpointer: memory });

    const input = {
      messages: [
        new SystemMessage(
          "You are a helpful assistant. Answer all questions to the best of your ability in English."
        ),
        ...messages,
        new HumanMessage("What math problem did I ask?"),
      ],
      language: "English",
    };
    const output = await app.invoke(input, configId);
    // The output contains all messages in the state.
    // This will log the last message in the conversation.
    console.log(output.messages[output.messages.length - 1]);
  } catch (error) {
    console.error("Error in chatModel:", error);
    throw error;
  }
};

export const AiModel = {
  chatModel,
};
