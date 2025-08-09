import express from "express";
import {
  getAllDocuments,
  getSingleDocument,
  addCustomerToDocument,
  getSingleCustomer,
  updateCustomer,
  deleteCustomer,
  addDocument,
  addCustomer
} from "../Controllers/documentCustomerController.js";
import { verifyAdmin } from '../utils/verifyToken.js'
import { createUploadMiddleware } from "../middlewares/uploadImage.js";
const uploadCCCD = createUploadMiddleware('uploads/cccd');

const router = express.Router();

// Get all document customer
router.post("/cccd/:id", uploadCCCD.array("picture", 50), addCustomer);
router.post("/", verifyAdmin, addDocument);
router.get("/", verifyAdmin, getAllDocuments);
router.get("/:id", verifyAdmin, getSingleDocument);
router.post("/:id", verifyAdmin, addCustomerToDocument);
router.get("/customers/:customer_id", verifyAdmin, getSingleCustomer);
router.put("/customers/:customer_id", verifyAdmin, updateCustomer);
router.delete("/:id/customers/:customer_id", verifyAdmin, deleteCustomer);

export default router;
