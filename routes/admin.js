import express from "express";
import {
  listAdmins,
  getAdminById,
  adminUpdateEmployer,
  deleteAdmin,
  listCollaborators,
} from "../Controllers/adminController.js";
import { verifySuperAdmin } from "../utils/verifyToken.js";

const router = express.Router();

// ==================== ADMIN MANAGEMENT ROUTES ====================

// List all admins with role "admin" (super_admin only)
router.get("/list", verifySuperAdmin, listAdmins);

router.get("/list/Collaborators", verifySuperAdmin, listCollaborators);

// Get admin by ID (super_admin only)
router.get("/:id", verifySuperAdmin, getAdminById);

// Update admin (super_admin only)
router.put("/:id", verifySuperAdmin, adminUpdateEmployer);

// Delete admin (super_admin only)
router.delete("/:id", verifySuperAdmin, deleteAdmin);

export default router;
