import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  media: { 
    url: { type: String, required: true }, 
    public_id: { type: String, required: true }, 
    type: { type: String, required: true } // image or video
  },
  eventType: { type: String, required: true }, // Birthday, Wedding, etc.
  createdAt: { type: Date, default: Date.now },
   
});

const Event =  mongoose.models.Event || mongoose.model("Event", EventSchema);
export default Event;
