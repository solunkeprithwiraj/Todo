const express = require("express");
const router = express.Router();
const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

const {  verifyEmail } = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");




// Route to create a new task
router.post("/tasks", protect, createTask);

// Route to get all tasks for the logged-in user
router.get("/tasks", protect, getAllTasks);

// Route to get a task by its ID
router.get("/task/:id", protect, getTaskById);

// Route to update a task by its ID
router.put("/task/:id", protect, updateTask);

// Route to delete a task by its ID
router.delete("/task/:id", protect, deleteTask);

module.exports = router;
