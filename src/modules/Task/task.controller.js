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
  const { category, type, textBody, listItems, isShared } = req.body;

  try {

    const taskInstance = new Task({
      category,
      type,
      textBody,
      listItems,
      isShared,
      addedBy: req.authUser._id,
    });


    const newTask = await taskInstance.save();
    res.status(201).json({ message: "Task added successfully", task: newTask });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Update job data
 * @param {Object} req - The request object containing updated job details.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with success message and updated job details.
 */
export const updateTask = async (req, res, next) => {
  const { taskId } = req.params;
  const { category, type, textBody, listItems, isShared, addedBy } = req.body;

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
    task.isShared = isShared || task.isShared;
    task.version_key += 1;

    const updatedTask = await task.save();
    res.status(200).json({ message: "task updated successfully", task: updatedTask });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Delete job data
 * @param {Object} req - The request object containing job ID.
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
 * @description Get all jobs with their company's information
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with the number of jobs and job details.
 */
export const getAllTasks = async (req, res, next) => {
  const { category, isShared, page = 1, limit = 10, sortBy } = req.query;
  const filter = { addedBy: req.authUser._id };
  try {

    if (category) {
      filter.category = category;
    }
    if (isShared) {
      filter.isShared = isShared === 'true';
    }

    const tasks = await Task.find(filter)
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('category')
      .populate('addedBy');

    res.status(200).json({ message: `Number of tasks fetched: ${tasks.length}`, tasks });
  } catch (err) {
    next(err);
  }
};

/**
 * @description Get all jobs for a specific company
 * @param {Object} req - The request object containing company name query parameter.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with the number of jobs and job details.
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
//  * @description Get all jobs that match the filters
//  * @param {Object} req - The request object containing job filters as query parameters.
//  * @param {Object} res - The response object.
//  * @returns {Object} JSON response with the number of jobs and job details.
//  */
// export const getFilteredJobs = async (req, res, next) => {
//   const { workingTime, jobLocation, seniorityLevel, jobTitle, technicalSkills } = req.query;

//   try {

//     const filters = {};
//     if (workingTime) filters.workingTime = workingTime;
//     if (jobLocation) filters.jobLocation = jobLocation;
//     if (seniorityLevel) filters.seniorityLevel = seniorityLevel;
//     if (jobTitle) filters.jobTitle = { $regex: jobTitle, $options: 'i' };
//     if (technicalSkills) filters.technicalSkills = { $in: technicalSkills.split(',') };

//     const jobs = await Job.find(filters).populate('addedBy');

//     res.status(200).json({ message: `Number of jobs fetched: ${jobs.length}`, jobs });
//   } catch (err) {
//     next(err);
//   }
// };