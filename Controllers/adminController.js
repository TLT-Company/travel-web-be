import Admin from "../models/Admin.js";
import Employer from "../models/Employer.js";
import { sequelize } from "../config/database.js";
import { Op } from "sequelize";
import path from 'path';

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
          as: "employer",
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

// ==================== LIST COLLABORATORS ====================

// List admins with role "admin"
export const listCollaborators = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {
      role: "collaborator",
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
          as: "employer",
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
        role: ["admin", "collaborator"],
      },
      attributes: { exclude: ["password_hash"] },
      include: [
        {
          model: sequelize.models.Employer,
          as: "employer",
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
export const adminUpdateEmployer = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, position } = req.body;

    const employer = await Employer.findOne({
      where: {
        admin_id: parseInt(id),
      },
    });

    if (!employer) {
      return res.status(404).json({
        success: false,
        message: "Employer không tồn tại!",
      });
    }

    // Update admin
    await employer.update({
      full_name: full_name || employer.full_name,
      position: position || employer.position,
    });

    res.status(200).json({
      success: true,
      message: "Cập nhật employer thành công!",
      data: employer,
    });
  } catch (error) {
    console.error("Update employer error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server! Vui lòng thử lại.",
    });
  }
};

export const adminUpdateCollaborator = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, position, email, password, confirmPassword } = req.body;

    const employer = await Employer.findOne({
      where: {
        admin_id: parseInt(id),
      },
    });

    if (!employer) {
      return res.status(404).json({
        success: false,
        message: "Employer không tồn tại!",
      });
    }

    // Update admin
    const updateData = {
      full_name: full_name || employer.full_name,
      position: position || employer.position,
      email: email || employer.email,
    };
    
    // Chỉ thêm password và confirm_password nếu cả 2 đều có giá trị
    if (password && confirmPassword) {
      updateData.password = password;
      updateData.confirm_password = confirmPassword;
    }
    
    await employer.update(updateData);

    res.status(200).json({
      success: true,
      message: "Cập nhật employer thành công!",
      data: employer,
    });
  } catch (error) {
    console.error("Update employer error:", error);
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


// ==================== DELETE COLLABORATOR ====================

// Delete collaborator
export const deleteCollaborator = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findOne({
      where: {
        id: parseInt(id),
        role: "collaborator",
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


// ==================== GET PROFILE ====================
export const getProfile = async (req, res) => {
  try {
    const id = req.user.id;

    const admin = await Admin.findOne({
      where: {
        id: Number(id)
      },
      attributes: { exclude: ["password_hash"] },
      include: [
        {
          model: Employer,
          as: "employer",
        },
      ],
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Thông tin người dùng không tồn tại!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy thông tin người dùng thành công!",
      data: admin,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server! Vui lòng thử lại.",
    });
  }
};

// ==================== UPDATE PROFILE ====================
export const updateProfile = async (req, res) => {
  try {
    const absolutePath  = req.file?.path || "";
    const filepath = path.relative(process.cwd(), absolutePath).replace(/\\/g, '/');

    const { id } = req.user;
    const {
      email,
      full_name,
      day_of_birth,
      phone_number,
      gender,
      address,
    } = req.body;

    const admin = await Admin.findByPk(Number(id))

    const employer = await Employer.findOne({
      where: {
        admin_id: Number(id)
      }
    });

    if(!employer || !admin) {
      return res.status(404).json({
          success: false,
          message: "Thông tin người dùng không tồn tại",
      });
    }

    if (email) {
      const existingEmail = await Admin.findOne({
        where: {
          email: email,
          id: { [Op.ne]: id }, 
        },
      });

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Email đã tồn tại",
        });
      }

      admin.email = email;
    }

    if (phone_number) {
      const existingPhone = await Employer.findOne({
        where: {
          phone_number,
          admin_id: { [Op.ne]: id },
        },
      });

      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "Số điện thoại đã được sử dụng",
        });
      }
    }

    if (full_name !== undefined) employer.full_name = full_name;
    if (day_of_birth !== undefined) employer.day_of_birth = day_of_birth;
    if (phone_number !== undefined) employer.phone_number = phone_number;
    if (gender !== undefined) employer.gender = gender;
    if (address !== undefined) employer.address = address;

    if (filepath) {
        employer.picture = filepath;
    }

    await Promise.all([admin.save(), employer.save()]);

    const updatedEmployer = await Admin.findOne({
      where: { id: Number(id) },
      attributes: { exclude: ["password_hash"] },
      include: [
        {
          model: Employer,
          as: "employer",
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "cập nhật thông tin thành công!",
      data: updatedEmployer,
    });
  } catch (error) {
    console.error("update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server! Vui lòng thử lại.",
    });
  }
};
