import express from "express";
import {
  createTask,
  assignTask,
  listTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskAssignmentStatus,
  listTaskAssignments,
} from "../Controllers/taskController.js";
import { verifyAdmin } from "../utils/verifyToken.js";

const router = express.Router();

// ==================== TASK ROUTES ====================

// Tạo task mới (Admin only)
router.post("/", verifyAdmin, createTask);

// Assign task cho nhân viên (Admin only)
router.post("/assign", verifyAdmin, assignTask);

// Lấy danh sách tasks (Admin only)
router.get("/", verifyAdmin, listTasks);

// ==================== TASK ASSIGNMENT ROUTES ====================

// Lấy danh sách task assignments
router.get("/assignments", verifyAdmin, listTaskAssignments);

// Cập nhật trạng thái task assignment
router.put("/assignment/:id/status", verifyAdmin, updateTaskAssignmentStatus);

// ==================== TASK ROUTES (CONTINUED) ====================

// Lấy thông tin task theo ID (Admin only)
router.get("/:id", verifyAdmin, getTaskById);

// Cập nhật task (Admin only)
router.put("/:id", verifyAdmin, updateTask);

// Xóa task (Admin only)
router.delete("/:id", verifyAdmin, deleteTask);

export default router;
