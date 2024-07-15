import { Router } from "express";
import * as taskController from "./task.controller.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";
import { validationMiddleware } from "../../Middlewares/validation.middleware.js";
import { authorize } from "../../Middlewares/authorization.middleware.js";
import { auth } from "../../Middlewares/authentication.middleware.js";
import { roles } from "../../utils/system-roles.utils.js";

const router = Router();

router.post("/add", errorHandler(auth()), errorHandler(taskController.addTask));

router.put("/update/:taskId", errorHandler(auth()), errorHandler(taskController.updateTask));

router.delete("/delete/:taskId", errorHandler(auth()), errorHandler(taskController.deleteTask));

router.get("/all", errorHandler(auth()), errorHandler(taskController.getAllTasks));

router.get("/category-tasks", errorHandler(auth()), errorHandler(taskController.getTaskInCategory));

router.get("/filter", errorHandler(auth()), errorHandler(taskController.getFilteredTasks));

export default router;
