import express from "express";
import { uploadImages } from "../Controllers/uploadController.js"
import { uploadMultiImage } from "../middlewares/uploadMultiImage.js"

const router = express.Router();

router.post("/", uploadMultiImage, uploadImages)

export default router;
