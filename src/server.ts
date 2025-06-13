import app from "./app";
import config from "./app/config";

async function main() {
  try {
    app.listen(config.port, () => {
      console.log(`Chat bot server is running on port ${config.port}`);
    });
  } catch (error) {
    console.log(error);
  }
}

main();
