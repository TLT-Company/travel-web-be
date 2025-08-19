import express from "express";
import {
  getAllDocumentExportHistories,
  getDocumentExportHistoryById,
  createDocumentExportHistory,
  updateDocumentExportHistory,
  deleteDocumentExportHistory,
  getDocumentExportHistoriesByStatus,
  performAnalysisFile,
  downloadFileById,
  exportAllCustomersToCSV,
} from "../Controllers/documentExportController.js";

const router = express.Router();

// Get all document export histories
router.get("/", getAllDocumentExportHistories);

// Get document export histories by status
router.get("/status/:status", getDocumentExportHistoriesByStatus);

// Download file by ID (must come before /:id route)
router.get("/download/:id", downloadFileById);

// Export all customers to CSV
router.get("/customer-csv", exportAllCustomersToCSV);

// Get document export history by ID
router.get("/:id", getDocumentExportHistoryById);

// Create new document export history
router.post("/", createDocumentExportHistory);

// Perform analysis file
router.post("/perform-analysis", performAnalysisFile);

// Update document export history
router.put("/:id", updateDocumentExportHistory);

// Delete document export history
router.delete("/:id", deleteDocumentExportHistory);

export default router;
