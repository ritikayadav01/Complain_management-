import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const sanitizePublicId = (value) => {
  const base = String(value || '')
    .replace(/\.[^/.]+$/, '')
    .trim()
    .toLowerCase();

  return base
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120) || `file-${Date.now()}`;
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isImage = file.mimetype.startsWith("image");
    const isVideo = file.mimetype.startsWith("video");

    const resourceType = isVideo ? "video" : (isImage ? "image" : "raw");

    return {
      folder: "smart-complaint-system",
      resource_type: resourceType,
      public_id: `${Date.now()}-${sanitizePublicId(file.originalname)}`,
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

export default upload;
