const Task = require("../models/Task");
const mongoose = require("mongoose");
const User = require("../models/User");


const adminGetAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const minTasks = parseInt(req.query.minTasks) || 0;
    const sortOrder = req.query.sort === "desc" ? -1 : 1;
    const searchQuery = req.query.search || ""; 

    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments();

    const usersWithTaskCount = await User.aggregate([
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "user",
          as: "tasks",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          taskCount: { $size: "$tasks" },
        },
      },
      {
        $match: {
          taskCount: { $gte: minTasks },
          name: { $regex: searchQuery, $options: "i" }, 
        },
      },
      { $sort: { taskCount: sortOrder } },
      { $skip: skip },
      { $limit: limit },
    ]);

    res.json({
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      users: usersWithTaskCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};



const adminEditTask = async (req, res) => {
  try {
    const { title, completed } = req.body;
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { title, completed },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};


const adminGetUserTasks = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.search || ""; 
    const status = req.query.status; 

    const filter = { user: id, isDeleted: false };

    if (searchQuery) {
      filter.title = { $regex: searchQuery, $options: "i" }; 
    }

    if (status) {
      filter.completed = status === "completed"; 
    }

    const totalTasks = await Task.countDocuments(filter);
    const tasks = await Task.find(filter).skip(skip).limit(limit);

    res.json({
      tasks,
      totalPages: Math.ceil(totalTasks / limit),
      currentPage: page,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};


const adminGetAllTasks = async (req, res) => {
  try {
    console.log("User Object in Protect:", req.user);

    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10; 
    const skip = (page - 1) * limit;

    const totalTasks = await Task.countDocuments({ isDeleted: false });
    const tasks = await Task.find({ isDeleted: false }).skip(skip).limit(limit);

    res.json({
      totalTasks,
      totalPages: Math.ceil(totalTasks / limit),
      currentPage: page,
      tasks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const adminSoftDeleteAllTasks = async (req, res) => {
  try {
    const updatedTasks = await Task.updateMany({}, { isDeleted: true });
    res.json({ message: "All tasks marked as deleted", updatedTasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const adminDeleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const adminToggleTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id); 

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { completed: !task.completed }, 
      { new: true, runValidators: true }
    );

    res.json(updatedTask);
  } catch (error) {
    console.error(error);

    if (error.name === "ValidationError") { 
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  adminGetAllTasks,
  adminSoftDeleteAllTasks,
  adminDeleteTask,
  adminToggleTask,
  adminGetAllUsers,
  adminGetUserTasks,
  adminEditTask,
};
