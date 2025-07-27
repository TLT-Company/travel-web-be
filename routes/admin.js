import express from "express";
import {
  listAdmins,
  getAdminById,
  adminUpdateEmployer,
  deleteAdmin,
  listCollaborators,
  adminUpdateCollaborator,
  deleteCollaborator,
} from "../Controllers/adminController.js";
import { verifySuperAdmin, verifyAdmin } from "../utils/verifyToken.js";

const router = express.Router();

// ==================== ADMIN MANAGEMENT ROUTES ====================

// List all admins with role "admin" (super_admin only)
router.get("/list", verifySuperAdmin, listAdmins);

router.get("/list/Collaborators", verifyAdmin, listCollaborators);

// Get admin by ID (super_admin only)
router.get("/:id", verifySuperAdmin, getAdminById);

// Update admin (super_admin only)
router.put("/:id", verifyAdmin, adminUpdateEmployer);
router.put("/collaborator/:id", verifyAdmin, adminUpdateCollaborator);

// Delete admin (super_admin only)
router.delete("/:id", verifySuperAdmin, deleteAdmin);
router.delete("/collaborator/:id", verifyAdmin, deleteCollaborator);

export default router;
