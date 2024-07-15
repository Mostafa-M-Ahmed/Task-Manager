import { Router } from "express";
import * as userController from "./user.controller.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";
import { validationMiddleware } from "../../Middlewares/validation.middleware.js";
import { SignUpSchema, SignInSchema, UpdateUserSchema, UpdatePasswordSchema} from "./user.schema.js";
import { auth } from "../../Middlewares/authentication.middleware.js";

const router = Router();

router.post("/sign-up", errorHandler(validationMiddleware(SignUpSchema)), errorHandler(userController.signUp));

router.post("/login", errorHandler(validationMiddleware(SignInSchema)), errorHandler(userController.login));

router.put("/update", errorHandler(auth()), errorHandler(validationMiddleware(UpdateUserSchema)), errorHandler(userController.updateUser));

router.delete("/delete", errorHandler(auth()), errorHandler(userController.deleteUser));

router.get("/user", errorHandler(auth()), errorHandler(userController.getUserData));

router.get("/profile/:_id", errorHandler(userController.getProfileData));

router.put("/update-password", errorHandler(auth()), errorHandler(validationMiddleware(UpdatePasswordSchema)), errorHandler(userController.updatePassword));


export default router;
