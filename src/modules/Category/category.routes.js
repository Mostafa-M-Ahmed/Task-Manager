import { Router } from "express";
import * as categoryController from "./category.controller.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";
import { auth } from "../../Middlewares/authentication.middleware.js";

const router = Router();

router.post("/add", errorHandler(auth()), errorHandler(categoryController.addCategory));

router.put("/update/:categoryId", errorHandler(auth()), errorHandler(categoryController.updateCategory));

router.delete("/delete/:categoryId", errorHandler(auth()), errorHandler(categoryController.deleteCategory));

router.get("/:categoryId", errorHandler(auth()), errorHandler(categoryController.getSpecificCategory));

router.get("/all", errorHandler(auth()), errorHandler(categoryController.getUserCategories));

router.post("/search", errorHandler(auth()), errorHandler(categoryController.searchCategory));

export default router;
