import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import tourRoute from "./routes/tours.js";
import userRoute from "./routes/users.js";
import authRoute from "./routes/auth.js";
import adminRoute from "./routes/admin.js";
// import reviewRoute from "./routes/reviews.js";
import bookingRoute from "./routes/bookings.js";
import documentExportRoute from "./routes/documentExport.js";
import documentCustomerRoute from "./routes/documentCustomer.js";
import collaboratorRoute from "./routes/collaborator.js";
import taskRoute from "./routes/tasks.js";
import uploadRoute from './routes/upload.js'
import { sequelize } from "./config/database.js";
import "./models/index.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const port = process.env.PORT || 8000;
const corsOptions = {
  origin: true,
  credentials: true,
};

const connect = async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connected successfully");

    // Sync all models with database
    await sequelize.sync({ alter: true });
    console.log("Database synchronized");
  } catch (error) {
    console.log("PostgreSQL connection failed:", error);
  }
};

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/tours", tourRoute);
app.use("/api/v1/users", userRoute);
// app.use("/api/v1/review", reviewRoute);
app.use("/api/v1/booking", bookingRoute);
app.use("/api/v1/document-export", documentExportRoute);
app.use("/api/v1/documents", documentCustomerRoute);
app.use("/api/v1/tasks", taskRoute);
app.use("/api/v1/bookings", bookingRoute);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/api/v1/uploads", uploadRoute);
app.use("/api/v1/collaborators", collaboratorRoute);

app.listen(port, () => {
  connect();
  console.log("server listening on port", port);
});
