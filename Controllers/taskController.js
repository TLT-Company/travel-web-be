import Task from "../models/Task.js";
import TaskAssignment from "../models/TaskAssignment.js";
import Employer from "../models/Employer.js";
import { sequelize } from "../config/database.js";

// ==================== CREATE TASK ====================

// Admin tạo task mới
export const createTask = async (req, res) => {
  try {
    const { name } = req.body;
    const adminId = req.user.id; // Lấy từ middleware verifyAdmin

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Tên task là bắt buộc!",
      });
    }

    // Create task
    const task = await Task.create({
      name,
    });

    res.status(201).json({
      success: true,
      message: "Tạo task thành công!",
      data: task,
    });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server! Vui lòng thử lại.",
    });
  }
};

// ==================== ASSIGN TASK ====================

// Admin assign task cho nhân viên
export const assignTask = async (req, res) => {
  try {
    const { task_id, employer_id, booking_id } = req.body;

    // Validate required fields
    if (!task_id || !employer_id) {
      return res.status(400).json({
        success: false,
        message: "Task ID, Employer ID là bắt buộc!",
      });
    }

    // Check if task exists
    const task = await Task.findByPk(task_id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task không tồn tại!",
      });
    }

    // Check if employer exists
    const employer = await Employer.findByPk(employer_id);
    if (!employer) {
      return res.status(404).json({
        success: false,
        message: "Nhân viên không tồn tại!",
      });
    }

    // Check if task is already assigned to this employer
    const existingAssignment = await TaskAssignment.findOne({
      where: {
        task_id,
        employer_id,
      },
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: "Task đã được assign cho nhân viên này!",
      });
    }

    // Create task assignment
    const taskAssignment = await TaskAssignment.create({
      task_id,
      employer_id,
      booking_id,
      assigned_at: new Date(),
      status: "new",
    });

    res.status(201).json({
      success: true,
      message: "Assign task thành công!",
      data: taskAssignment,
    });
  } catch (error) {
    console.error("Assign task error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server! Vui lòng thử lại.",
    });
  }
};

// ==================== LIST TASKS ====================

// Lấy danh sách tasks với pagination và filter
export const listTasks = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {};

    if (search) {
      whereClause.name = {
        [sequelize.Op.like]: `%${search}%`,
      };
    }

    // Find tasks with pagination
    const { count, rows: tasks } = await Task.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: TaskAssignment,
          as: "taskAssignments",
          include: [
            {
              model: Employer,
              as: "employer",
              attributes: ["id", "full_name", "position"],
            },
          ],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["id", "DESC"]],
    });

    // Calculate pagination info
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      message: "Lấy danh sách tasks thành công!",
      data: {
        tasks,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
          hasNextPage,
          hasPrevPage,
        },
      },
    });
  } catch (error) {
    console.error("List tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server! Vui lòng thử lại.",
    });
  }
};

// ==================== GET TASK BY ID ====================

// Lấy thông tin task theo ID
export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id, {
      include: [
        {
          model: TaskAssignment,
          as: "taskAssignments",
          include: [
            {
              model: Employer,
              as: "employer",
              attributes: ["id", "full_name", "position"],
            },
          ],
        },
      ],
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task không tồn tại!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy thông tin task thành công!",
      data: task,
    });
  } catch (error) {
    console.error("Get task by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server! Vui lòng thử lại.",
    });
  }
};

// ==================== UPDATE TASK ====================

// Cập nhật thông tin task
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task không tồn tại!",
      });
    }

    // Update task
    await task.update({
      name: name || task.name,
    });

    res.status(200).json({
      success: true,
      message: "Cập nhật task thành công!",
      data: task,
    });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server! Vui lòng thử lại.",
    });
  }
};

// ==================== DELETE TASK ====================

// Xóa task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task không tồn tại!",
      });
    }

    // Check if task has assignments
    const assignments = await TaskAssignment.findAll({
      where: { task_id: id },
    });

    if (assignments.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa task đã được assign!",
      });
    }

    // Delete task
    await task.destroy();

    res.status(200).json({
      success: true,
      message: "Xóa task thành công!",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server! Vui lòng thử lại.",
    });
  }
};

// ==================== UPDATE TASK ASSIGNMENT STATUS ====================

// Cập nhật trạng thái task assignment
export const updateTaskAssignmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const taskAssignment = await TaskAssignment.findByPk(id);
    if (!taskAssignment) {
      return res.status(404).json({
        success: false,
        message: "Task assignment không tồn tại!",
      });
    }

    // Validate status
    const validStatuses = ["new", "in_progress", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ!",
      });
    }

    // Update status
    await taskAssignment.update({ status });

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái task thành công!",
      data: taskAssignment,
    });
  } catch (error) {
    console.error("Update task assignment status error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server! Vui lòng thử lại.",
    });
  }
};

// ==================== LIST TASK ASSIGNMENTS ====================

// Lấy danh sách task assignments
export const listTaskAssignments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, employer_id } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    if (employer_id) {
      whereClause.employer_id = employer_id;
    }

    // Find task assignments with pagination
    const { count, rows: taskAssignments } =
      await TaskAssignment.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Task,
            as: "task",
            attributes: ["id", "name", "description", "priority", "deadline"],
          },
          {
            model: Employer,
            as: "employer",
            attributes: ["id", "full_name", "position"],
          },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["assigned_at", "DESC"]],
      });

    // Calculate pagination info
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      message: "Lấy danh sách task assignments thành công!",
      data: {
        taskAssignments,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
          hasNextPage,
          hasPrevPage,
        },
      },
    });
  } catch (error) {
    console.error("List task assignments error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server! Vui lòng thử lại.",
    });
  }
};
