import { Router } from "express";
import * as categoryController from "./category.controller.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";
import { validationMiddleware } from "../../Middlewares/validation.middleware.js";
import { AddCompanySchema, UpdateCompanySchema } from "./category.schema.js";
import { authorize } from "../../Middlewares/authorization.middleware.js";
import { auth } from "../../Middlewares/authentication.middleware.js";
import { roles } from "../../utils/system-roles.utils.js";

const router = Router();

router.post("/add", errorHandler(auth()), errorHandler(categoryController.addCategory));

router.put("/update/:categoryId", errorHandler(auth()), errorHandler(categoryController.updateCategory));

router.delete("/delete/:categoryId", errorHandler(auth()), errorHandler(categoryController.deleteCategory));

router.get("/data/:categoryId", errorHandler(auth()), errorHandler(categoryController.getCategoryData));

router.get("/search", errorHandler(auth()), errorHandler(categoryController.searchCategory));

export default router;
