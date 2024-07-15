import Category from "../../../DB/models/category.model.js";
import Task from "../../../DB/models/task.model.js";
import User from "../../../DB/models/user.model.js";
import { ErrorClass } from "../../utils/error-class.utils.js";

/**
 * @description Add a new category
 * @param {Object} req - The request object containing category details.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with success message and category details.
 */
export const addCategory = async (req, res, next) => {
  try {
    const { name, user } = req.body;

    // Check if the company name or email already exists
    const isCategoryExists = await Category.findOne({ name });
    if (isCategoryExists) {
      return next(new ErrorClass("Category already exists", 400, "Category must have unique Name and Email", "Category.controller.addCategory.isCategoryExists"));
    }

    // Create new category instance
    const categoryInstance = new Category({
      name,
      user: req.authUser._id,
    });

    const newCategory = await categoryInstance.save();
    res.status(201).json({ message: "Category added successfully", category: newCategory });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Update category data
 * @param {Object} req - The request object containing updated category details.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with success message and updated category details.
 */
export const updateCategory = async (req, res, next) => {
  const { categoryId } = req.params;
  const { name } = req.body;

  try {
    const category = await Category.findById(categoryId);

    // Check if the category exists and if the user is the owner
    if (!category || category.user.toString() !== req.authUser._id.toString()) {
      return next(new ErrorClass("Not found or unauthorized", 404, "Not found or unauthorized", "category.controller.updatecategory.categoryCheck"));
    }

    if (name && name !== category.name) {
      const isNameExists = await Category.findOne({ name });
      if (isNameExists) {
        return next(new ErrorClass("category name already exists", 400, "category name already exists", "category.controller.updatecategory.nameExists"));
      }
      category.name = name;
    }

    // Update category data
    category.version_key += 1;

    const updatedCategory = await category.save();

    res.status(200).json({ message: "Category updated successfully", category: updatedCategory });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Delete category data
 * @param {Object} req - The request object containing category ID.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with success message.
 */
export const deleteCategory = async (req, res, next) => {
  const { categoryId } = req.params;

  try {
    const category = await Category.findByIdAndDelete(categoryId);

    // Check if the category exists and if the user is the owner
    if (!category || category.user.toString() !== req.authUser._id.toString()) {
      return next(new ErrorClass("Not found or unauthorized", 404, "Not found or unauthorized", "category.controller.deleteCategory.categoryExists"));
    }

    // Delete all tasks related to this category
    await Task.deleteMany({ category: categoryId });

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Get company data along with associated jobs
 * @param {Object} req - The request object containing company ID.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with company and job details.
 */
export const getCategoryData = async (req, res, next) => {
  const { categoryId } = req.params;

  try {
    const category = await Category.findById(categoryId);

    // Check if the category exists
    if (!category) {
      return next(new ErrorClass("category not found", 404, "category not found", "category.controller.getcategory.categoryExists"));
    }

    // Get all jobs related to this category
    const tasks = await Task.find({ category: category._id });

    res.status(200).json({ message: "Category data fetched successfully", category, tasks });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Search for a company by name
 * @param {Object} req - The request object containing company name as query parameter.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with number of companies found and company details.
 */
export const searchCategory = async (req, res, next) => {
  const { name } = req.query;

  try {
    const categories = await Category.find({ name: { $regex: name, $options: 'i' } });

    res.status(200).json({ message: `Number of categories fetched: ${categories.length}`, categories });
  } catch (err) {
    next(err);
  }
};
