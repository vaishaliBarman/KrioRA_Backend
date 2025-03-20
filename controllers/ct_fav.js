import tbl_fav from "../models/tbl_fav.js";
import tbl_user from "../models/tbl_user.js";
import Event from "../models/tbl_Event.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// ✅ Add event to favorites
export const addFav = async (req, res) => {
  console.log("addFav controller called");

  try {
    const { eventId } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    console.log("Received Token:", token);
    if (!token) return res.status(401).json({ message: "Unauthorized: No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // Extract user ID correctly
    console.log("User ID:", userId);

    if (!userId) return res.status(400).json({ message: "Invalid User ID" });

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Check if already favorited
    const existingFav = await tbl_fav.findOne({ user: userId, event: eventId });
    if (existingFav) return res.status(400).json({ message: "Already added to favorites" });

    // Add favorite
    const newFav = new tbl_fav({ user: userId, event: eventId });
    await newFav.save();

    // Add event to user's savedEvents array
    await tbl_user.findByIdAndUpdate(userId, { $push: { savedEvents: eventId } });

    console.log("✅ Event added to favorites");
    return res.status(201).json({ success: true, message: "Added to favorites", favorite: newFav });
  } catch (error) {
    console.error("❌ Failed to add event to favorites:", error);
    return res.status(500).json({ success: false, message: "Error adding to favorites", error });
  }
};

export const getFav = async (req, res) => {
  try {

    console.log("getFav controller called");

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized: No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; 
    console.log("User ID:", userId);

    if (!userId) return res.status(400).json({ message: "Invalid User ID" });

    const favorites = await tbl_fav.find({ user: userId }).populate("event");

    console.log("Decoded User ID:", decoded.id);
    console.log("Favorites:", favorites);

    return res.status(200).json({ success: true, favorites });  // ✅ Only one response sent
  } catch (error) {
    console.error("❌ Failed to retrieve favorites:", error);

    if (!res.headersSent) { // ✅ Ensure response is sent only once
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
};
// ✅ Remove event from favorites
export const deleteFav = async (req, res) => {
  try {
    console.log("deleteFav controller called");

    const favId = req.params.favId;
    console.log("Fav ID received:", favId);

    console.log("User ID:", req.user?._id); // ✅ Debugging log

    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    const deletedFav = await tbl_fav.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(favId),
      user: new mongoose.Types.ObjectId(req.user._id),
    });
    

    if (!deletedFav) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    res.json({ success: true, message: "Favorite removed successfully" });

  } catch (error) {
    console.error("Failed to remove event from favorites:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};