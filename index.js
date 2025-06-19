import { createDeepSeek } from "@ai-sdk/deepseek";
import { HumanMessage } from "@langchain/core/messages";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { StateGraph } from "@langchain/langgraph";
import { DynamicTool } from "@langchain/core/tools";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// Initialize DeepSeek model
const deepseekModel = createDeepSeek({
  apiKey: DEEPSEEK_API_KEY,
});

// Create a simple calculator tool for testing
const calculatorTool = new DynamicTool({
  name: "calculator",
  description:
    "A simple calculator that adds two numbers. Input should be two numbers separated by a comma, like '2,3'",
  func: async (input) => {
    const [a, b] = input.split(",").map(Number);
    if (isNaN(a) || isNaN(b)) {
      return "Please provide two numbers separated by a comma";
    }
    return `The result is ${a + b}`;
  },
});

// Tools array with just our calculator
const tools = [calculatorTool];
const toolNode = new ToolNode(tools);

// Bind tools to the DeepSeek model
const model = deepseekModel.bindTools(tools);

function shouldContinue({ messages }) {
  const lastMessage = messages[messages.length - 1];
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  return "__end__";
}

async function callModel(state) {
  const response = await model.invoke(state.messages);
  return { messages: [response] };
}

// Create the workflow
const workflow = new StateGraph({
  channels: {
    messages: {
      value: (x, y) => x.concat(y),
      default: () => [],
    },
  },
})
  .addNode("agent", callModel)
  .addEdge("__start__", "agent")
  .addNode("tools", toolNode)
  .addEdge("tools", "agent")
  .addConditionalEdges("agent", shouldContinue);

const app = workflow.compile();

// Test with simple calculation
const calcState = await app.invoke({
  messages: [
    new HumanMessage("What is 2 plus 3? Use the calculator if needed."),
  ],
});
console.log(calcState.messages[calcState.messages.length - 1].content);

// Test with follow-up question
const followUpState = await app.invoke({
  messages: [
    ...calcState.messages,
    new HumanMessage("Now add 5 to that result"),
  ],
});
console.log(followUpState.messages[followUpState.messages.length - 1].content);
