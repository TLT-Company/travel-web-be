import jwt from "jsonwebtoken";

// Verify token from both header and cookie
export const verifyToken = (req, res, next) => {
  try {
    // Check for token in Authorization header first
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    } else {
      // Fallback to cookie
      token = req.cookies?.accessToken;
    }

    // Debug logging
    console.log("Token verification attempt:", {
      hasAuthHeader: !!authHeader,
      hasCookie: !!req.cookies?.accessToken,
      tokenLength: token ? token.length : 0,
    });

    if (!token) {
      console.log("No token found in request");
      return res.status(401).json({
        success: false,
        message: "Bạn chưa được xác thực! Vui lòng đăng nhập.",
      });
    }

    // Verify the token
    const secretKey = process.env.JWT_SECRET_KEY || "your-secret-key";
    console.log("Using secret key:", secretKey ? "***" : "undefined");

    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        console.log("Token verification failed:", err.message);
        return res.status(401).json({
          success: false,
          message: "Token không hợp lệ hoặc đã hết hạn!",
        });
      }

      console.log("Token verified successfully for user:", {
        id: user.id,
        role: user.role,
        username: user.username,
      });

      req.user = user;
      next();
    });
  } catch (error) {
    console.error("Error in verifyToken middleware:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi xác thực token!",
    });
  }
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
