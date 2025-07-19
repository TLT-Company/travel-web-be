import express from "express";
import {
  getAllDocuments,
  getSingleDocument,
  addCustomerToDocument,
  getSingleCustomer,
  updateCustomer,
  deleteCustomer
} from "../Controllers/documentCustomerController.js";

const router = express.Router();

// Get all document customer
router.get("/", getAllDocuments);
router.get("/:id", getSingleDocument);
router.post("/:id", addCustomerToDocument);
router.get("/customers/:customer_id", getSingleCustomer);
router.put("/customers/:customer_id", updateCustomer);
router.delete("/:id/customers/:customer_id", deleteCustomer);

export default router;
