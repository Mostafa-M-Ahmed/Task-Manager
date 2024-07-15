import express from "express";
import path from "path";
import { config } from "dotenv";

import userRouter from "./src/modules/User/user.routes.js";
import categoryRouter from "./src/modules/Category/category.routes.js";
import taskRouter from "./src/modules/Task/task.routes.js";
import { connection_db } from "./DB/connection.js";
import { globaleResponse } from "./src/Middlewares/error-handling.middleware.js";

const app = express();

// check the environment if it is dev or production
if (process.env.NODE_ENV == "dev") {
  config({ path: path.resolve(".dev.env") });
}
if (process.env.NODE_ENV == "prod") {
  config({ path: path.resolve(".prod.env") });
}
config();

const port = process.env.PORT;

app.use(express.json());

app.use("/user", userRouter);
app.use("/category", categoryRouter);
app.use("/task", taskRouter);

// for handeling errors
app.use(globaleResponse);

// connecting to DB
connection_db();

app.get("/", (req, res) => res.send("Welcome to Task Manager"));
app.listen(port, () => console.log(`Task Manager app listening on port ${port}!`));
