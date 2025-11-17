import jwt from "jsonwebtoken";

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.json({ success: false, message: "Not Authorized, login again" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.email !== process.env.ADMIN_EMAIL || decoded.role !== "admin") {
      return res.json({ success: false, message: "Not Authorized, login again" });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    console.log("Admin auth error:", error);
    return res.json({ success: false, message: "Not Authorized, login again" });
  }
};

export default adminAuth;
