import express from "express";
import { getAllProvinces, getAllCommunesOfProvinces } from "../Controllers/provinceController.js";

const router = express.Router();

router.get("/", getAllProvinces)
router.get("/:id", getAllCommunesOfProvinces)

export default router;
