import express from "express";
import {
  userRegister,
  userLogin,
  adminRegister,
  adminLogin,
  logout,
  getCurrentUser,
  getCurrentAdmin,
  forgotPasswordAdmin,
  resetPasswordAdmin,
} from "../Controllers/authController.js";

import { verifyToken, verifySuperAdmin } from "../utils/verifyToken.js";
// import bcrypt from 'bcryptjs'
// import jwt from 'jsonwebtoken'

const router = express.Router();

// ==================== USER ROUTES ====================
router.post("/user/register", userRegister);
router.post("/user/login", userLogin);
router.get("/user/me", verifyToken, getCurrentUser);

// ==================== ADMIN ROUTES ====================
router.post("/admin/register", adminRegister);
router.post("/admin/login", adminLogin);
router.get("/admin/me", verifyToken, getCurrentAdmin);
router.post("/admin/forgot-password", forgotPasswordAdmin);
router.post("/admin/reset-password", resetPasswordAdmin);

// ==================== COMMON ROUTES ====================
router.post("/logout", logout);

export default router;
