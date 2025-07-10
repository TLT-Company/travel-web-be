import jwt from "jsonwebtoken";

// Verify token from both header and cookie
export const verifyToken = (req, res, next) => {
  // Check for token in Authorization header first
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7); // Remove 'Bearer ' prefix
  } else {
    // Fallback to cookie
    token = req.cookies?.accessToken;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Bạn chưa được xác thực! Vui lòng đăng nhập.",
    });
  }

  // Verify the token
  jwt.verify(
    token,
    process.env.JWT_SECRET_KEY || "your-secret-key",
    (err, user) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: "Token không hợp lệ hoặc đã hết hạn!",
        });
      }

      req.user = user;
      next();
    }
  );
};

// Verify user token (for customer routes)
export const verifyUser = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === "user") {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập trang này!",
      });
    }
  });
};

// Verify admin token (for admin routes)
export const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === "admin" || req.user.role === "super_admin") {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập trang admin!",
      });
    }
  });
};

// Verify super admin token (for super admin only routes)
export const verifySuperAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === "super_admin") {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: "Bạn cần quyền super admin để truy cập trang này!",
      });
    }
  });
};

// Verify user can access their own data or admin can access any data
export const verifyUserOrAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === "admin" || req.user.role === "super_admin") {
      next();
    } else if (
      req.user.role === "user" &&
      req.user.id === parseInt(req.params.id)
    ) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập dữ liệu này!",
      });
    }
  });
};
