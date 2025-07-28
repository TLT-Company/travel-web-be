import express from "express";
import {
  getProfileCollaborator,
  updateProfileCollaborator
} from "../Controllers/collaboratorController.js";
import { verifyCollaborator } from "../utils/verifyToken.js";
import { createUploadMiddleware } from "../middlewares/uploadImage.js";
import { handleUploadErrors } from "../middlewares/handleUploadErrors.js"

const router = express.Router();
const uploadAvatar = createUploadMiddleware('uploads/profile/collaborator');

// Get collaborator by ID
router.get("/profile", verifyCollaborator, getProfileCollaborator);
router.put("/profile",uploadAvatar.single("picture"), handleUploadErrors, verifyCollaborator, updateProfileCollaborator);

export default router;
