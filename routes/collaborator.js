import express from "express";
import {
  getProfileCollaborator,
  updateProfileCollaborator
} from "../Controllers/collaboratorController.js";
import { verifyCollaborator } from "../utils/verifyToken.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

// ==================== ADMIN MANAGEMENT ROUTES ====================

// Get collaborator by ID
router.get("/profile", verifyCollaborator, getProfileCollaborator);
router.put("/profile",upload.single("picture"), verifyCollaborator, updateProfileCollaborator);

export default router;
