import express from "express";
import bodyParser from "body-parser";
import { connectToTheDatabase } from "./src/lib/database";
import config from "./src/configs/config";
import UserController from "./src/auth/users/user.controller";
import ComplaintController from "./src/complaints/complaint.controller";
import errorHandlerMiddleware from "./src/middleware/error.middleware";

const app = express();
app.use(bodyParser.json());

async function startServer() {
  try {
    await connectToTheDatabase();

    await initializeControllers([
      new UserController(),
      new ComplaintController(),
    ]);

    await initializeErrorHandlerMiddleware();

    app.listen(config.server.port, () => {
      console.log(`Server is running on port ${config.server.port}`);
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error starting server:", error.message);
    } else {
      console.error("Unknown error starting server");
    }
  }
}

async function initializeControllers(controllers: any[]) {
  for (const controller of controllers) {
    app.use("/", controller.router);
  }
}

async function initializeErrorHandlerMiddleware() {
  app.use(errorHandlerMiddleware);
}

startServer();
