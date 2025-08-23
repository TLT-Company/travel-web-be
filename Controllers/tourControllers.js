import { Tour, Booking, Admin, Customer, User } from "../models/index.js";
import { Op, fn, col } from "sequelize";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Create new tour
export const createTour = async (req, res) => {
  const {
    name,
    description,
    location,
    price,
    start_date,
    end_date,
    image_url_1,
    image_url_2,
    image_url_3,
    image_url_4,
    image_url_5,
    image_url_6,
    image_url_7,
    image_url_8,
    image_url_9,
    image_url_10,
  } = req.body;
  const created_by = req.user.id;

  let imageUrls = {};
  if (req.files && req.files.length > 0) {
    imageUrls = Array.from({ length: 10 }).reduce((acc, _, i) => {
      acc[`image_url_${i + 1}`] = req.files[i]
        ? `/uploads/${req.files[i].filename}`
        : null;
      return acc;
    }, {});
  } else {
    imageUrls = {
      image_url_1,
      image_url_2,
      image_url_3,
      image_url_4,
      image_url_5,
      image_url_6,
      image_url_7,
      image_url_8,
      image_url_9,
      image_url_10,
    };
  }

  try {
    const tour = await Tour.create({
      name,
      description,
      location,
      price: Number(price),
      start_date,
      end_date,
      created_by,
      ...imageUrls,
    });

    res.status(200).json({
      success: true,
      message: "Successfully created",
      data: tour,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create. Try again!",
    });
  }
};

//Update Tour
export const updateTour = async (req, res) => {
  const id = req.params.id;

  try {
    const updateData = { ...req.body };

    if (typeof updateData.price === "string") {
      updateData.price = Number(updateData.price);
    }

    const [updatedCount, updatedRows] = await Tour.update(updateData, {
      where: { id },
      returning: true,
    });

    if (updatedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tour để cập nhật",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật tour thành công",
      data: updatedRows[0],
    });
  } catch (error) {
    console.error("Lỗi cập nhật tour:", error);
    res.status(500).json({
      success: false,
      message: "Cập nhật tour thất bại",
      error: error.message,
    });
  }
};

//Delete Tour
export const deleteTour = async (req, res) => {
  const id = req.params.id;

  try {
    await Tour.destroy({ where: { id } });

    res.status(200).json({ success: true, message: "Xóa tour thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Xóa tour thất bại" });
  }
};

//Get single Tour
export const getSingleTour = async (req, res) => {
  const id = req.params.id;

  try {
    const tour = await Tour.findOne({
      where: { id: id },
      include: [
        {
          model: Booking,
          as: "bookings",
          include: [
            {
              model: Customer,
              as: "customer",
              attributes: ["id", "full_name"],
              include: [
                {
                  model: User,
                  as: "user",
                  attributes: ["id", "email", "role"],
                },
              ],
            },
            {
              model: Admin,
              as: "assignedAdmin",
              attributes: ["id", "email", "role"],
            },
          ],
          order: [["createdAt", "DESC"]],
        },
      ],
    });

    res
      .status(200)
      .json({ success: true, message: "Successfully", data: tour });
  } catch (error) {
    res.status(404).json({ success: false, message: "Not Found" });
  }
};

//Get All Tour
export const getAllTour = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const whereCondition = buildTourFilter(req.query);

  try {
    const { rows: tours, count } = await Tour.findAndCountAll({
      where: whereCondition,
      attributes: {
        include: [[fn("COUNT", col("bookings.id")), "total_customers"]],
      },
      include: [{ model: Booking, as: "bookings", attributes: [] }],
      group: ["Tour.id"],
      offset,
      limit,
      subQuery: false,
    });

    res.status(200).json({
      success: true,
      count: count.length,
      message: "Successfully",
      data: tours,
    });
  } catch (error) {
    res.status(404).json({ success: false, message: "Not Found" });
  }
};

const removeVietnameseTones = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
};

const buildTourFilter = (query) => {
  const {
    name,
    location,
    price_min,
    price_max,
    start_date,
    end_date,
    month_year,
  } = query;

  const where = {};

  if (name) {
    where.slug_name = {
      [Op.iLike]: `%${removeVietnameseTones(name.trim())}%`,
    };
  }

  if (location) {
    where.slug_location = {
      [Op.iLike]: `%${removeVietnameseTones(location.trim())}%`,
    };
  }

  const min = price_min !== undefined ? Number(price_min) : undefined;
  const max = price_max !== undefined ? Number(price_max) : undefined;

  if (!isNaN(min) && !isNaN(max)) {
    where.price = { [Op.between]: [min, max] };
  } else if (!isNaN(min)) {
    where.price = { [Op.gte]: min };
  } else if (!isNaN(max)) {
    where.price = { [Op.lte]: max };
  }

  if (start_date) {
    where.start_date = { [Op.gte]: start_date };
  }

  if (end_date) {
    where.end_date = { [Op.lte]: end_date };
  }

  if (month_year) {
    const [year, month] = month_year.split("-").map(Number);
    const firstDay = new Date(year, month - 1, 1); // ngày đầu tháng
    const lastDay = new Date(year, month, 0, 23, 59, 59); // cuối tháng

    where.end_date = {
      [Op.between]: [firstDay, lastDay],
      [Op.lt]: new Date(),
    };
  }

  return where;
};

// Get tour by search
export const getListToursByMonth = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const whereCondition = buildTourFilter(req.query);

  try {
    const { rows: tours, count } = await Tour.findAndCountAll({
      where: whereCondition,
      attributes: {
        include: [[fn("COUNT", col("bookings.id")), "total_customers"]],
      },
      include: [{ model: Booking, as: "bookings", attributes: [] }],
      group: ["Tour.id"],
      offset,
      limit,
      subQuery: false,
    });

    res.status(200).json({
      success: true,
      count: count.length,
      message: "Successfully",
      data: tours,
    });
  } catch (error) {
    res.status(404).json({ success: false, message: "Not Found" });
  }
};

//Get featured Tour
export const getFeaturedTour = async (req, res) => {
  try {
    const tours = await Tour.find({ featured: true })
      .populate("reviews")
      .limit(8);

    res
      .status(200)
      .json({ success: true, message: "Successfully", data: tours });
  } catch (error) {
    res.status(404).json({ success: false, message: "Not Found" });
  }
};

//Get tour count
export const getTourCount = async (req, res) => {
  try {
    const tourCount = await Tour.estimatedDocumentCount();

    res.status(200).json({ success: true, data: tourCount });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch" });
  }
};

// Get all images from bookings for a specific tour and zip them
export const getTourImagesZip = async (req, res) => {
  const { tourId } = req.params;

  try {
    // Validate tour exists
    const tour = await Tour.findByPk(tourId);
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour không tồn tại",
      });
    }

    // Get all bookings for this tour with image fields
    const bookings = await Booking.findAll({
      where: { tour_id: tourId },
      attributes: ["front_image", "back_image", "picture_avatar"],
      raw: true,
    });

    console.log(`Found ${bookings.length} bookings for tour ${tourId}`);

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không có booking nào cho tour này",
      });
    }

    // Collect all image paths
    const imagePaths = [];
    bookings.forEach((booking) => {
      if (booking.front_image) imagePaths.push(booking.front_image);
      if (booking.back_image) imagePaths.push(booking.back_image);
      if (booking.picture_avatar) imagePaths.push(booking.picture_avatar);
    });

    if (imagePaths.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không có hình ảnh nào cho tour này",
      });
    }

    // Create zip file
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const zipFileName = `tour_${tourId}_images_${timestamp}.zip`;
    const zipFilePath = path.join(
      __dirname,
      "../public/export/tour_images",
      zipFileName
    );

    // Ensure export directory exists
    const exportDir = path.dirname(zipFilePath);
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Sets the compression level
    });

    output.on("close", () => {
      // Send the zip file for download
      res.download(zipFilePath, zipFileName, (err) => {
        if (err) {
          console.error("Error sending file:", err);
        }
        // Clean up the zip file after sending
        fs.unlink(zipFilePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error("Error deleting zip file:", unlinkErr);
          }
        });
      });
    });

    archive.on("error", (err) => {
      console.error("Archive error:", err);
      res.status(500).json({
        success: false,
        message: "Lỗi khi tạo file zip",
      });
    });

    archive.pipe(output);

    // Add images to zip
    let addedImagesCount = 0;
    imagePaths.forEach((imagePath, index) => {
      if (imagePath) {
        const fullImagePath = path.join(__dirname, "..", imagePath);
        if (fs.existsSync(fullImagePath)) {
          // Extract filename from path for zip
          const fileName = path.basename(imagePath);
          archive.file(fullImagePath, { name: fileName });
          addedImagesCount++;
        }
      }
    });

    if (addedImagesCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy file hình ảnh nào trên server",
      });
    }

    archive.finalize();
  } catch (error) {
    console.error("Error in getTourImagesZip:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xử lý yêu cầu",
    });
  }
};
