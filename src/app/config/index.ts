import dotenv from "dotenv";

dotenv.config();

export default {
  port: 3000,
  lang_smith_trace: process.env.LANGSMITH_TRACING,
  lang_smith_api_key: process.env.LANGSMITH_API_KEY,
  lang_smith_project_name: process.env.LANGSMITH_PROJECT,
  google_api_key: process.env.GOOGLE_API_KEY,
};
