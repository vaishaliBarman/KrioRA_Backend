import jwt from "jsonwebtoken";
import tbl_user from "../models/tbl_user.js";
  const authMiddleware = async (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    console.log("Received Token:", token); // Debug token

    if (!token) {
        return res.status(401).json({ message: "No token provided, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded); // Check if token is decoded correctly

        req.user = await tbl_user.findById(decoded.id).select("-password");
        if (!req.user) {
            return res.status(401).json({ message: "User not found" });
        }

        next();
    } catch (error) {
        console.error("Token Verification Error:", error.message);
        res.status(401).json({ message: "Invalid token" });
    }
};

export default authMiddleware;
