import express from "express";
import {
  getAllProvinces,
  getAllCommunesOfProvinces,
  getProvinceByCCCD,
} from "../Controllers/provinceController.js";

const router = express.Router();

router.get("/", getAllProvinces);
router.get("/cccd/:cccd", getProvinceByCCCD);
router.get("/:id", getAllCommunesOfProvinces);

export default router;
