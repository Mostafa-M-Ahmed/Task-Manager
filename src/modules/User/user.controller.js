import jwt from "jsonwebtoken";
import { compareSync, hashSync } from "bcrypt";
import User from "../../../DB/models/user.model.js";
import { sendEmailService } from "../../services/send-email.service.js";
import { ErrorClass } from "../../utils/error-class.utils.js";
import Category from "../../../DB/models/category.model.js";
import Task from "../../../DB/models/task.model.js";


/**
 * @description Sign up a new user.
 * @param {Object} req - The request object containing user details.
 * @param {Object} res - The response object to send the result.
 * @returns {Object} A confirmation message and the created user.
 */
export const signUp = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const isEmailExists = await User.findOne({ email });
    if (isEmailExists) {
      return next(new ErrorClass("Email already exists", 400, "Email already exists"));
    }

    const userInstance = new User({
      name,
      email,
      password: hashSync(password, +process.env.SALT_ROUNDS)
    });

    const newUser = await userInstance.save();
    res.status(201).json({ confirmation: "A confirmation link is sent to your email!", message: "User created successfully", user: newUser });
  } catch (err) {
    next(err);
  }

};

/**
 * @description Sign in a user.
 * @param {Object} req - The request object containing credentials.
 * @param {Object} res - The response object to send the result.
 * @returns {Object} A success message and a token.
 */
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorClass("Invalid credentials", 400, "Invalid credentials"));
    }

    const isMatch = compareSync(password, user.password);
    if (!isMatch) {
      return next(new ErrorClass("Invalid credentials", 400, "Invalid credentials"));
    }

    const token = jwt.sign({ userId: user._id }, process.env.LOGIN_SECRET);

    res.status(200).json({ message: "User signed in successfully", token });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Update a user's account.
 * @param {Object} req - The request object containing updated user details.
 * @param {Object} res - The response object to send the result.
 * @returns {Object} A success message and the updated user.
 */
export const updateAccount = async (req, res, next) => {
  const { _id } = req.authUser;
  const { email, name } = req.body;

  try {
    const user = await User.findById(_id);

    if (!user) {
      return next(new ErrorClass("User not found", 404, "User not found"));
    }

    if (email && email !== user.email) {
      const isEmailExists = await User.findOne({ email });
      if (isEmailExists) {
        return next(new ErrorClass("Email already exists", 400, "Email already exists"));
      }
      user.email = email;
    }

    // Update user data
    user.name = name || user.name;
    user.version_key += 1;

    await user.save();
    res.status(200).json({ message: "User updated successfully", user });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Delete a user's account.
 * @param {Object} req - The request object containing the user ID.
 * @param {Object} res - The response object to send the result.
 * @returns {Object} A success message.
 */
export const deleteAccount = async (req, res, next) => {
  const { _id } = req.authUser;
  const { role } = req.authUser;

  try {
    const user = await User.findByIdAndDelete(_id);

    if (!user) {
      return next(new ErrorClass("User not found", 404, "User not found"));
    }

    // const companies = await Company.find();

    // for (const company of companies) {
    //   if (company.companyHR.toString() === user._id.toString()) {
    //     const jobs = await Job.find({ addedBy: company._id });

    //     for (const job of jobs) {
    //       await Application.deleteMany({ jobId: job._id });
    //     }

    //     await Job.deleteMany({ addedBy: company._id });
    //     await Company.findByIdAndDelete(company._id);
    //   }
    // }

    // // Delete all applications by this user (if any)
    // await Application.deleteMany({ userId: user._id });

    res.status(200).json({ message: "User account deleted successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Get a user's account data.
 * @param {Object} req - The request object containing the user ID.
 * @param {Object} res - The response object to send the result.
 * @returns {Object} The user's account data.
 */
export const getAccountData = async (req, res, next) => {
  const { _id } = req.authUser;

  try {
    const user = await User.findById(_id).select('-password');

    if (!user) {
      return next(new ErrorClass("User not found", 404, "User not found"));
    }

    res.status(200).json({ message: "User account data fetched successfully", user });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Get profile data for another user.
 * @param {Object} req - The request object containing the user ID.
 * @param {Object} res - The response object to send the result.
 * @returns {Object} The user's profile data.
 */
export const getProfileData = async (req, res, next) => {
  const { _id } = req.params;

  try {
    const user = await User.findById(_id).select('-password');

    if (!user) {
      return next(new ErrorClass("User not found", 404, "User not found"));
    }

    res.status(200).json({ message: "User profile data fetched successfully", user });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Update a user's password.
 * @param {Object} req - The request object containing the old and new passwords.
 * @param {Object} res - The response object to send the result.
 * @returns {Object} A success message.
 */
export const updatePassword = async (req, res, next) => {
  const { _id } = req.authUser;
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(_id);

    if (!user) {
      return next(new ErrorClass("User not found", 404, "User not found", "user.controller.updatePassword.user"));
    }

    const isMatch = compareSync(oldPassword, user.password);
    if (!isMatch) {
      return next(new ErrorClass("Invalid old password", 400, "Invalid old password", "user.controller.updatePassword.isMatch"));
    }

    user.password = hashSync(newPassword, +process.env.SALT_ROUNDS);
    user.version_key += 1;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
};
