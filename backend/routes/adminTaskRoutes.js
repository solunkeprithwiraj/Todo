const {
  adminGetAllTasks,
  adminSoftDeleteAllTasks,
  adminDeleteTask,
  adminToggleTask,
  adminGetAllUsers,
  adminGetUserTasks,
  adminEditTask
} = require("../controllers/adminController");
const Task = require("../models/Task");
const express = require("express");
const router = express.Router();
const { protectAdmin } = require("../middleware/adminAuthMiddleware");
const { protect } = require("../middleware/authMiddleware");

//atogglecompletion for admin
router.put("/admin/task/:id", protect,protectAdmin, adminToggleTask);
// Fetch all tasks (Admin Only)
router.get("/admin/tasks", protect, protectAdmin, adminGetAllTasks);


router.get("/admin/users", protect,protectAdmin,adminGetAllUsers);

router.patch("/admin/tasks/:id", protect,protectAdmin,adminEditTask)
router.get("/admin/user/:id/tasks", protect, protectAdmin, adminGetUserTasks)
//  Delete a specific task (Admin Only)
router.delete("/admin/tasks/:id", protect, protectAdmin, adminDeleteTask);

//  Delete all tasks (Admin Only)
router.patch(
  "/admin/tasks/delete",
  protect,
  protectAdmin,
  adminSoftDeleteAllTasks
);

module.exports = router;