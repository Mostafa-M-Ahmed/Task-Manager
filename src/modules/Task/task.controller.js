import Task from "../../../DB/models/task.model.js";
import Category from "../../../DB/models/category.model.js";
import { ErrorClass } from "../../utils/error-class.utils.js";

/**
 * @description Add a new task
 * @param {Object} req - The request object containing task details.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with success message and task details.
 */
export const addTask = async (req, res, next) => {
  const { category, type, textBody, listItems, isPrivate } = req.body;

  try {

    const taskInstance = new Task({
      category,
      type,
      textBody,
      listItems,
      isPrivate,
      addedBy: req.authUser._id,
    });


    const newTask = await taskInstance.save();
    res.status(201).json({ message: "Task added successfully", task: newTask });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Update task data
 * @param {Object} req - The request object containing updated task details.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with success message and updated task details.
 */
export const updateTask = async (req, res, next) => {
  const { taskId } = req.params;
  const { category, type, textBody, listItems, isPrivate, addedBy } = req.body;

  try {

    const task = await Task.findById(taskId);

    // Check if the task exists and if the user is the owner
    if (!task || task.addedBy.toString() !== req.authUser._id.toString()) {
      return next(new ErrorClass("Not found or unauthorized", 404, "Not found or unauthorized"));
    }

    // Update task data
    task.category = category || task.category;
    task.type = type || task.type;
    task.textBody = textBody || task.textBody;
    task.listItems = listItems || task.listItems;
    task.isPrivate = isPrivate || task.isPrivate;
    task.version_key += 1;

    const updatedTask = await task.save();
    res.status(200).json({ message: "task updated successfully", task: updatedTask });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Delete task data
 * @param {Object} req - The request object containing task ID.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with success message.
 */
export const deleteTask = async (req, res, next) => {
  const { taskId } = req.params;

  try {
    const task = await Task.findByIdAndDelete(taskId);

    // Check if the task exists and if the user is the owner
    if (!task || task.addedBy.toString() !== req.authUser._id.toString()) {
      return next(new ErrorClass("Not found or unauthorized", 404, "Not found or unauthorized"));
    }

    res.status(200).json({ message: "task deleted successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Get all tasks with their company's information
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with the number of tasks and task details.
 */
export const getAllTasks = async (req, res, next) => {
  const { page = 1, limit = 10, category, isPrivate, sortBy } = req.query;
  const filter = { addedBy: req.authUser._id };
  try {
    if (category) {
      filter.category = category;
    }
    if (isPrivate) {
      filter.isPrivate = isPrivate === 'true';
    }

    const tasks = await Task.find(filter)
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('category')
      .populate('addedBy')

      let count = await Task.countDocuments();
        if (filter != '') {
            count = tasks.length
        }

    // res.json({ message: `Number of tasks fetched: ${tasks.length}`, tasks });
    res.status(200).json({ message: `Showing ${limit} tasks per page.`, totalTasks: count, totalPages: Math.ceil(count / limit), currentPage: parseInt(page), tasks });

  } catch (err) {
    next(err);
  }
};

/**
 * @description Get all tasks for a specific company
 * @param {Object} req - The request object containing company name query parameter.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with the number of tasks and task details.
 */
export const getTaskInCategory = async (req, res, next) => {
  const { name } = req.query;

  try {
    const category = await Category.findOne({ name });

    if (!category) {
      return next(new ErrorClass("Category not found", 404, "Category not found"));
    }

    const tasks = await Task.find({ addedBy: category._id });

    res.status(200).json({ message: `Number of tasks fetched: ${tasks.length}`, tasks });
  } catch (err) {
    next(err);
  }
};

// /**
//  * @description Get all tasks that match the filters
//  * @param {Object} req - The request object containing task filters as query parameters.
//  * @param {Object} res - The response object.
//  * @returns {Object} JSON response with the number of tasks and task details.
//  */
// export const getFilteredtasks = async (req, res, next) => {
//   const { workingTime, taskLocation, seniorityLevel, taskTitle, technicalSkills } = req.query;

//   try {

//     const filters = {};
//     if (workingTime) filters.workingTime = workingTime;
//     if (taskLocation) filters.taskLocation = taskLocation;
//     if (seniorityLevel) filters.seniorityLevel = seniorityLevel;
//     if (taskTitle) filters.taskTitle = { $regex: taskTitle, $options: 'i' };
//     if (technicalSkills) filters.technicalSkills = { $in: technicalSkills.split(',') };

//     const tasks = await task.find(filters).populate('addedBy');

//     res.status(200).json({ message: `Number of tasks fetched: ${tasks.length}`, tasks });
//   } catch (err) {
//     next(err);
//   }
// };