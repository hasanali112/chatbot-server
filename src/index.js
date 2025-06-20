import express from "express";
import cors from "cors";
import { agent } from "./agent/index.js";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/generate", async (req, res) => {
  const { prompt, thread_id } = req.body;
  const result = await agent.invoke(
    {
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    },
    {
      configurable: { thread_id: thread_id },
    }
  );

  res.json(result.messages.at(-1).content);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
