import tbl_user from "../models/tbl_user.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const Signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(req.body);
    
    // Check if user already exists
    const existingUser = await tbl_user.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    console.log(existingUser);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Check if user can be admin
    let role = "user";  // Default role
    const allowedAdmins = ["k@gmail.com"]; // Change these to real admin emails

    if (allowedAdmins.includes(email.toLowerCase())) {
      role = "admin";
    }

    // Create a new user with role
    const newUser = new tbl_user({ name, email, password: hashedPassword, role });
    await newUser.save();
     
    console.log(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { email: newUser.email, id: newUser._id, role: newUser.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );

    res.status(201).json({ result: newUser, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

 
export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login request received:", email, password);

    const user = await tbl_user.findOne({ email });
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User doesn't exist" });
    }

    console.log("User found:", user.email);
    
    if (!user.password) {
      console.log("No password stored for this user");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    console.log("Password correct:", isPasswordCorrect);

    if (!isPasswordCorrect) {
      console.log("Incorrect password");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate Access Token (short expiry)
    const token = jwt.sign(
      { email: user.email, id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "16m" }
    );

    // Generate Refresh Token (long expiry)
    const refreshToken = jwt.sign(
      { email: user.email, id: user._id },
      process.env.REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // Store Refresh Token in an HTTP-only Cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true, // Use only in HTTPS
      sameSite: "Strict",
    });

    // Store Access Token in an HTTP-only Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Use only in HTTPS
      sameSite: "Strict",
    });

    console.log("Login successful");
    res.json({ token, role: user.role });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Server error" });
  }
};


//--------- Google Sign-in ----------
export const GoogleSignin = async (req, res) => {
  try {
    const { tokenId } = req.body;

    // Verify Google token
    const response = await client.verifyIdToken({ idToken: tokenId, audience: process.env.GOOGLE_CLIENT_ID });
    const { email_verified, name, email, picture, sub: googleId } = response.payload;

    if (!email_verified) {
      return res.status(403).json({ message: "Google authentication failed" });
    }

    // Check if user exists
    let user = await tbl_user.findOne({ email });

    if (!user) {
      // Create a new user if not found
      user = new tbl_user({ name, email, googleId, profilePic: picture });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ result: user, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

//--------- Get All Users ----------
export const getUsers = async (req, res) => {
  try {
    // Extract token from headers
    const token = req.headers.authorization?.split(" ")[1];
    console.log("Received Token:", token);  // Debugging token

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded); // Debugging decoded token

    // Find user using the decoded email
    const user = await tbl_user.findOne({ _id: decoded.id});

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ role: user.role, name: user.name, email: user.email });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Unauthorized: No refresh token" });
    }

    jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden: Invalid refresh token" });
      }

      // Generate a new access token
      const newAccessToken = jwt.sign(
        { email: user.email, id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "16m" }
      );

      res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(500).json({ message: "Server error" });
  }
};


 
