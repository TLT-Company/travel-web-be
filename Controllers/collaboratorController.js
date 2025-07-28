import Admin from "../models/Admin.js";
import Employer from "../models/Employer.js";
import { Op } from "sequelize";
import path from 'path';

// Get ProfileCollaborator
export const getProfileCollaborator = async (req, res) => {
  try {
    const id = req.user.id;

    const collaborator = await Admin.findOne({
      where: {
        id: Number(id),
        role: "collaborator"
      },
      attributes: { exclude: ["password_hash"] },
      include: [
        {
          model: Employer,
          as: "employer",
        },
      ],
    });

    if (!collaborator) {
      return res.status(404).json({
        success: false,
        message: "Cộng tác viên không tồn tại!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy thông tin cộng tác viên thành công!",
      data: collaborator,
    });
  } catch (error) {
    console.error("Get profile collaborator error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server! Vui lòng thử lại.",
    });
  }
};

// update ProfileCollaborator
export const updateProfileCollaborator = async (req, res) => {
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

    const collaborator = await Employer.findOne({
      where: {
        admin_id: Number(id)
      }
    });

    if(!collaborator || !admin) {
      return res.status(404).json({
          success: false,
          message: "Cộng tác viên không tồn tại",
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

    if (full_name !== undefined) collaborator.full_name = full_name;
    if (day_of_birth !== undefined) collaborator.day_of_birth = day_of_birth;
    if (phone_number !== undefined) collaborator.phone_number = phone_number;
    if (gender !== undefined) collaborator.gender = gender;
    if (address !== undefined) collaborator.address = address;

    if (filepath) {
        collaborator.picture = filepath;
    }

    await Promise.all([admin.save(), collaborator.save()]);

    res.status(200).json({
      success: true,
      message: "cập nhật thông tin cộng tác viên thành công!",
      data: collaborator,
    });
  } catch (error) {
    console.error("update profile Collaborator error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server! Vui lòng thử lại.",
    });
  }
};