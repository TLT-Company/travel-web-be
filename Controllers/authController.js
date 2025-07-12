import User from "../models/User.js";
import Admin from "../models/Admin.js";
import Customer from "../models/Customer.js";
import { sequelize } from "../config/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ==================== USER AUTHENTICATION ====================

// User register
export const userRegister = async (req, res) => {
  try {
    const { email, password, full_name, phone_number } = req.body;

    // Validate required fields
    if (!email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: "Email, password và full_name là bắt buộc!",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email đã tồn tại!",
      });
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);

    // Create user
    const user = await User.create({
      email,
      password_hash,
    });

    // Create customer profile
    const customer = await Customer.create({
      user_id: user.id,
      full_name,
      phone_number,
      verified_status: "pending",
    });

    // Remove password from response
    const { password_hash: _, ...userWithoutPassword } = user.toJSON();

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công!",
      data: {
        user: userWithoutPassword,
        customer: customer,
      },
    });
  } catch (error) {
    console.error("User register error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server! Vui lòng thử lại.",
    });
  }
};

// User login
export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email và password là bắt buộc!",
      });
    }

    // Find user with customer profile
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Customer,
          as: "customer",
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Tài khoản không tồn tại!",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng!",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: "user",
        customer_id: user.customer?.id,
      },
      process.env.JWT_SECRET_KEY || "your-secret-key",
      { expiresIn: "24h" }
    );

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user.toJSON();

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công!",
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    console.error("User login error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server! Vui lòng thử lại.",
    });
  }
};

// ==================== ADMIN AUTHENTICATION ====================

// Admin register (only super_admin can create new admin)
export const adminRegister = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, password là bắt buộc!",
      });
    }

    // Validate role
    if (!["super_admin", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role phải là 'super_admin' hoặc 'admin'!",
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Email đã tồn tại!",
      });
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);

    // Create admin
    const admin = await Admin.create({
      email,
      password_hash,
      role,
    });

    // Create employer profile if role is admin
    let employer = null;
    if (role === "admin") {
      employer = await sequelize.models.Employer.create({
        admin_id: admin.id,
      });
    }

    // Remove password from response
    const { password_hash: _, ...adminWithoutPassword } = admin.toJSON();

    res.status(201).json({
      success: true,
      message: "Tạo admin thành công!",
      data: {
        admin: adminWithoutPassword,
        employer: employer,
      },
    });
  } catch (error) {
    console.error("Admin register error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server! Vui lòng thử lại.",
    });
  }
};

// Admin login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email và password là bắt buộc!",
      });
    }

    // Find admin with employer profile
    const admin = await Admin.findOne({
      where: { email },
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
        message: "Tài khoản không tồn tại!",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng!",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        employer_id: admin.employers?.[0]?.id,
      },
      process.env.JWT_SECRET_KEY || "your-secret-key",
      { expiresIn: "24h" }
    );

    // Remove password from response
    const { password_hash, ...adminWithoutPassword } = admin.toJSON();

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công!",
      data: {
        admin: adminWithoutPassword,
        token,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server! Vui lòng thử lại.",
    });
  }
};

// ==================== LOGOUT ====================

// Logout (for both user and admin)
export const logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Đăng xuất thành công!",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server! Vui lòng thử lại.",
    });
  }
};

// ==================== GET CURRENT USER/ADMIN ====================

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findOne({
      where: { id: userId },
      include: [
        {
          model: Customer,
          as: "customer",
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User không tồn tại!",
      });
    }

    const { password_hash, ...userWithoutPassword } = user.toJSON();

    res.status(200).json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server! Vui lòng thử lại.",
    });
  }
};

// Get current admin
export const getCurrentAdmin = async (req, res) => {
  try {
    const adminId = req.user.id;

    const admin = await Admin.findOne({
      where: { id: adminId },
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

    const { password_hash, ...adminWithoutPassword } = admin.toJSON();

    res.status(200).json({
      success: true,
      data: adminWithoutPassword,
    });
  } catch (error) {
    console.error("Get current admin error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server! Vui lòng thử lại.",
    });
  }
};

