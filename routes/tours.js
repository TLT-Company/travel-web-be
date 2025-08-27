import express from "express";
import {
  createTour,
  deleteTour,
  getAllTour,
  getFeaturedTour,
  getSingleTour,
  getListToursByMonth,
  getTourCount,
  updateTour,
  getTourImagesZip,
} from "../Controllers/tourControllers.js";
import { uploadMultiImage } from "../middlewares/uploadMultiImage.js";
import { verifyAdmin } from "../utils/verifyToken.js";

const router = express.Router();

//Create new tour
router.post("/", verifyAdmin, uploadMultiImage, createTour);

//Update tour
router.patch("/:id", verifyAdmin, uploadMultiImage, updateTour);

//Delete tour
router.delete("/:id", verifyAdmin, deleteTour);

//Get all tour
router.get("/", getAllTour);

//Get tour by search
router.get("/by-month", getListToursByMonth);
router.get("/search/getFeaturedTour", getFeaturedTour);
router.get("/search/getTourCount", getTourCount);

//Get single tour
router.get("/:id", getSingleTour);

//Download tour images as zip
router.get("/:tourId/images/zip", getTourImagesZip);

export default router;
