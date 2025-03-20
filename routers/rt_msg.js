import express from "express";
import { sendMessage, getMessages } from "../controllers/ct_msg.js";

const router = express.Router();

router.post("/send", sendMessage);
router.get("/:sender/:receiver", getMessages);

export default router;
