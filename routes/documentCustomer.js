import express from "express";
import {
  getAllDocuments,
  getSingleDocument,
  addCustomerToDocument,
  getSingleCustomer,
  updateCustomer,
  deleteCustomer
} from "../Controllers/documentCustomerController.js";
import { verifyAdmin } from '../utils/verifyToken.js'

const router = express.Router();

// Get all document customer
router.get("/", verifyAdmin, getAllDocuments);
router.get("/:id", verifyAdmin, getSingleDocument);
router.post("/:id", verifyAdmin, addCustomerToDocument);
router.get("/customers/:customer_id", verifyAdmin, getSingleCustomer);
router.put("/customers/:customer_id", verifyAdmin, updateCustomer);
router.delete("/:id/customers/:customer_id", verifyAdmin, deleteCustomer);

export default router;
