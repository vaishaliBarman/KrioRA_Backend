import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    let folder = "events";
    let resourceType = file.mimetype.startsWith("video") ? "video" : "image";
    return {
      folder: folder,
      resource_type: resourceType,// Auto-detect (image/video)
      public_id: `${Date.now()}-${file.originalname}`
    };
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image") || file.mimetype.startsWith("video")) {
      cb(null, true);
    } else {
      cb(new Error("Only images and videos are allowed!"), false);
    }
  }
});

export default upload;
