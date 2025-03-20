import express from "express";
import { createEvent, getAllEvents, deleteEvent,  getEventByType,  saveEvent, getSavedEvents, getAllSavedEvents,removeEvent,  editEvent   } from "../controllers/ct_Event.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.post("/createEvent", upload.single("media"), createEvent); // Create an event
router.get("/getAllEvents", getAllEvents); // Get all events
router.delete("/deleteEvent/:eventId", deleteEvent); // Delete event
router.get("/events/:eventType", getEventByType); // Get all events by type
router.post("/save", saveEvent);
router.get("/saved/:userId", getSavedEvents);
router.get("/admin/saved-events", getAllSavedEvents);
router.delete("/remove/:eventId", removeEvent);
router.put("/edit/:eventId", editEvent);


export default router;
