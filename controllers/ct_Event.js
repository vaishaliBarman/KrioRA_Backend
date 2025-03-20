
import cloudinary from "../cloudinary.js";
import Event from "../models/tbl_Event.js";
// Create Event with Image/Video Upload
export const createEvent = async (req, res) => {
  try {
    const { title, eventType } = req.body;

    if (!title || !eventType) {
      return res.status(400).json({ error: "Please fill all fields" });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: "Please upload an image or video" });
    }
    // Determine the resource type based on file mimetype
    const resourceType = req.file.mimetype.startsWith("video") ? "video" : "image";


    // Upload to Cloudinary with the correct resource type
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: resourceType, // Explicitly set type
      folder: "events",
    });

    const newEvent = new Event({
      title,
      eventType,
      media: {
        url: result.secure_url,
        public_id: result.public_id,
        type: result.resource_type
      }
    });

    await newEvent.save();
    res.status(201).json({ success: true, event: newEvent });
  } catch (error) {
    res.status(500).json({ error: "Failed to create event", details: error.message });
  }
};

// Get All Events
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events", details: error.message });
  }
};

// Delete Event & Remove from Cloudinary
export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(event.media.public_id, { resource_type: event.media.type });

    // Delete from Database
    await Event.findByIdAndDelete(eventId);

    res.json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete event", details: error.message });
  }
};

// Get Events by Type 
export const getEventByType = async (req, res) => {
  try {
    const { eventType } = req.params;
    const events = await Event.find({ eventType });
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events", details: error.message });
  }
};

// Save Event
export const saveEvent = async (req, res) => {
  try {
    const { eventId, userId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    if (event.saved.includes(userId)) {
      return res.status(400).json({ error: "Event already saved" });
    }

    event.saved.push(userId);
    await event.save();

    res.json({ success: true, message: "Event saved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to save event", details: error.message });
  }
};

// Get Saved Events
export const getSavedEvents = async (req, res) => {
  try {
    const { userId } = req.params;
    const events = await Event.find({ saved: userId });
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch saved events", details: error.message });
  }
};

// Get All Saved Events (Admin)
export const getAllSavedEvents = async (req, res) => {
  try {
    const events = await Event.find({ saved: { $exists: true, $not: { $size: 0 } } });
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch saved events", details: error.message });
  }
};

// Remove Event 

export const removeEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findByIdAndDelete(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    res.json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete event", details: error.message });
  }
};

// Update Event

export const editEvent = async (req, res) => {
  try{
    const { eventId } = req.params;
    const { title, eventType } = req.body;

    const event = await
    Event.findById(eventId);

    if (!event) return res.status(404).json({ error: "Event not found" });

    event.title = title || event.title;
    event.eventType = eventType || event.eventType;

    await event.save();
    res.json({ success: true, event });

  }
  catch (error) {
    res.status(500).json({ error: "Failed to update event", details: error.message });
  }
}


