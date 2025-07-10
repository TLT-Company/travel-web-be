import Admin from "../models/Admin.js";
import { sequelize } from "../config/database.js";

// ==================== LIST ADMINS ====================

// List admins with role "admin"
export const listAdmins = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {
      role: "admin",
    };

    // Add search functionality if provided
    if (search) {
      whereClause.email = {
        [sequelize.Op.like]: `%${search}%`,
      };
    }

    // Find admins with pagination
    const { count, rows: admins } = await Admin.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ["password_hash"] }, // Exclude password from response
      include: [
        {
          model: sequelize.models.Employer,
          as: "employers",
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
    });

    // Calculate pagination info
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      message: "Lấy danh sách admin thành công!",
      data: {
        admins,
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
    console.error("List admins error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server! Vui lòng thử lại.",
    });
  }
};

// ==================== GET ADMIN BY ID ====================

// Get admin by ID
export const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findOne({
      where: {
        id: parseInt(id),
        role: "admin",
      },
      attributes: { exclude: ["password_hash"] },
      include: [
        {
          model: sequelize.models.Employer,
          as: "employers",
        },
      ],
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin không tồn tại!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy thông tin admin thành công!",
      data: admin,
    });
  } catch (error) {
    console.error("Get admin by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server! Vui lòng thử lại.",
    });
  }
};

// ==================== UPDATE ADMIN ====================

// Update admin
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;

    const admin = await Admin.findOne({
      where: {
        id: parseInt(id),
        role: "admin",
      },
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin không tồn tại!",
      });
    }

    // Update admin
    await admin.update({
      email: email || admin.email,
      role: role || admin.role,
    });

    // Remove password from response
    const { password_hash, ...adminWithoutPassword } = admin.toJSON();

    res.status(200).json({
      success: true,
      message: "Cập nhật admin thành công!",
      data: adminWithoutPassword,
    });
  } catch (error) {
    console.error("Update admin error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server! Vui lòng thử lại.",
    });
  }
};

// ==================== DELETE ADMIN ====================

// Delete admin
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findOne({
      where: {
        id: parseInt(id),
        role: "admin",
      },
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin không tồn tại!",
      });
    }

    // Delete admin
    await admin.destroy();

    res.status(200).json({
      success: true,
      message: "Xóa admin thành công!",
    });
  } catch (error) {
    console.error("Delete admin error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server! Vui lòng thử lại.",
    });
  }
};
