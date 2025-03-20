import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String },
    googleId: { type: String, unique: true, sparse: true },
    profilePic: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

const tbl_user = mongoose.model("tbl_user", userSchema);
export default tbl_user;
