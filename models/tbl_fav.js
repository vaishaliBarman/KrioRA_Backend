
import mongoose from "mongoose";

const FavSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "tbl_user" },
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" }, // Use the correct model name
  
})

const tbl_fav = mongoose.model("tbl_fav", FavSchema);
export default tbl_fav;