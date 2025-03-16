const Task = require("../models/Task");
const mongoose = require("mongoose");

// @desc    Create a new task
// @route   POST /tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    const { title, completed = false } = req.body; 
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
    const newTask = new Task({
      title,
      completed,
      user: req.user.id,
    });
    const savedTask = await newTask.save();
    const populatedTask = await Task.findById(savedTask._id).populate(
      "user",
      "-password"
    );
    res.status(201).json(populatedTask);
  } catch (error) {
    console.error("Create Task Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all tasks of the logged-in user
// @route   GET /tasks
// @access  Private
const getAllTasks = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const {
      search,
      completed,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;
    const skip = (page - 1) * limit;

    let query = { user: req.user.id, isDeleted: false };

   
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    
    if (completed !== undefined) {
      query.completed = completed === "true";
    }

    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    
    const totalTasks = await Task.countDocuments(query);

    
    const tasks = await Task.find(query)
      .populate("user", "-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalPages = Math.ceil(totalTasks / limit);

    res.status(200).json({
      totalTasks,
      totalPages,
      currentPage: page,
      tasks,
    });
  } catch (error) {
    console.error("Get All Tasks Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};



// @desc    Get a single task by ID
// @route   GET /tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const taskId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(taskId).populate("user", "-password");

    if (!task || task.user._id.toString() !== req.user.id) {
      return res
        .status(404)
        .json({ message: "Task not found or unauthorized" });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Get Task By ID Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update a task
// @route   PUT /tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(taskId);
    if (!task || task.user._id.toString() !== req.user.id) {
      return res
        .status(404)
        .json({ message: "Task not found or unauthorized" });
    }

    const { title, completed } = req.body;
    if (!title && completed === undefined) {
      return res
        .status(400)
        .json({ message: "At least one field is required for update" });
    }

    task.title = title || task.title;
    if (completed !== undefined) task.completed = completed;

    const updatedTask = await task.save();
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Update Task Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete a task
// @route   DELETE /tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(taskId);
    if (!task || task.user.toString() !== req.user.id) {
      return res
        .status(404)
        .json({ message: "Task not found or unauthorized" });
    }

    await task.deleteOne();
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete Task Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
