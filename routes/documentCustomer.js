import express from "express";
import {
  getAllDocuments,
  getSingleDocument,
  addCustomerToDocument,
  getSingleCustomer,
  updateCustomer,
  deleteCustomer,
  addDocument,
  scanCCCDAndaddCustomer
} from "../Controllers/documentCustomerController.js";
import { verifyAdmin } from '../utils/verifyToken.js'
import { createUploadMiddleware } from "../middlewares/uploadImage.js";
import { handleUploadErrors } from "../middlewares/handleUploadErrors.js"
const uploadCCCD = createUploadMiddleware('uploads/cccd/customers');

const router = express.Router();

// Get all document customer
router.post("/scancccd/:id", verifyAdmin, uploadCCCD.array("images", 50), handleUploadErrors, scanCCCDAndaddCustomer);
router.post("/", verifyAdmin, addDocument);
router.get("/", verifyAdmin, getAllDocuments);
router.get("/:id", verifyAdmin, getSingleDocument);
router.post("/:id", verifyAdmin, addCustomerToDocument);
router.get("/customers/:customer_id", verifyAdmin, getSingleCustomer);
router.put("/customers/:customer_id", verifyAdmin, updateCustomer);
router.delete("/:id/customers/:customer_id", verifyAdmin, deleteCustomer);

export default router;
