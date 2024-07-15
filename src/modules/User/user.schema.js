import Joi from "joi";
import { roles } from "../../utils/system-roles.utils.js";
import { systemRoles } from "../../utils/system-roles.utils.js";

export const SignUpSchema = {
  body: Joi.object({
    name: Joi.string().min(3).max(30).alphanum().required(),
    email: Joi.string().required().email({
      minDomainSegments: 2,
      maxDomainSegments: 4,
      tlds: { allow: ["com", "net", "org"] },
    }),
    password: Joi.string()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$!%*?&])[A-Za-z\d$!%*?&]{8,}$/
      )
      .required()
      .messages({
        "string.pattern.base":
          "Password must have at least one lowercase letter, one uppercase letter, one number and one special character",
        "any.required": "You need to provide a password",
        "string.min": "Password should have a minimum length of 3 characters",
      })
  }),
};

export const SignInSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  })
};


export const UpdateUserSchema = {
  body: Joi.object({
    name: Joi.string().min(3).max(30).alphanum(),
    email: Joi.string().email(),
  }).or('email', 'name')
};

export const UpdatePasswordSchema = {
  body: Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$!%*?&])[A-Za-z\d$!%*?&]{8,}$/
      )
      .required()
      .messages({
        "string.pattern.base": "Password must have at least one lowercase letter, one uppercase letter, one number and one special character",
        "any.required": "You need to provide a password",
        "string.min": "Password should have a minimum length of 3 characters",
      }),
  })
};