import express from "express";
import { addFav, getFav, deleteFav } from "../controllers/ct_fav.js";
import authMiddleware from "../middleware/authmiddleware.js"; 

const router = express.Router();

router.post("/addFav", authMiddleware, (req, res, next) => {
    console.log("POST /addFav route hit");
    next();
}, addFav); // Add event to favorites

router.get("/getFav", authMiddleware, (req, res, next) => {
    console.log("GET /getFav route hit");
    next();
}, getFav); // Get user's favorite events

router.delete("/deleteFav/:favId", authMiddleware, (req, res, next) => {
    console.log("DELETE /deleteFav/:favId route hit");
    next();
}, deleteFav); // Remove from favorites

export default router;
