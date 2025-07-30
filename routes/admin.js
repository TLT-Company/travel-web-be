import express from "express";
import {
  listAdmins,
  getAdminById,
  adminUpdateEmployer,
  deleteAdmin,
  listCollaborators,
  adminUpdateCollaborator,
  deleteCollaborator,
  getProfile,
  updateProfile,
} from "../Controllers/adminController.js";
import { verifySuperAdmin, verifyAdmin, verifyToken } from "../utils/verifyToken.js";
import { createUploadMiddleware } from "../middlewares/uploadImage.js";
import { handleUploadErrors } from "../middlewares/handleUploadErrors.js"
const uploadAvatar = createUploadMiddleware('uploads/profile/admin');

const router = express.Router();

// ==================== ADMIN MANAGEMENT ROUTES ====================

// List all admins with role "admin" (super_admin only)
router.get("/list", verifySuperAdmin, listAdmins);

router.get("/list/Collaborators", verifyAdmin, listCollaborators);

// Get Profile
router.get("/profile", verifyToken, getProfile);
router.put("/profile",uploadAvatar.single("picture"), handleUploadErrors, verifyToken, updateProfile);

// Get admin by ID (super_admin only)
router.get("/:id", verifySuperAdmin, getAdminById);

// Update admin (super_admin only)
router.put("/:id", verifyAdmin, adminUpdateEmployer);
router.put("/collaborator/:id", verifyAdmin, adminUpdateCollaborator);

// Delete admin (super_admin only)
router.delete("/:id", verifySuperAdmin, deleteAdmin);
router.delete("/collaborator/:id", verifyAdmin, deleteCollaborator);


export default router;
