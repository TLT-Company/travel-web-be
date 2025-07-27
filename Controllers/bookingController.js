import Admin from "../models/Admin.js";
import Employer from "../models/Employer.js";
import Booking from "./../models/Booking.js";

// create new booking
// export const createBooking = async (req, res) => {
//   try {
//     const savedBooking = await Booking.create(req.body);

//     res.status(200).json({
//       success: true,
//       message: "Your tour is booked!",
//       data: savedBooking,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Internal server error!" });
//   }
// };

export const createBooking = async (req, res) => {
  try {
    const { note, referral_code, tour_id } = req.body;
    const frontImagePath = req.files?.front_image?.[0]?.path || null;
    const backImagePath = req.files?.back_image?.[0]?.path || null;

    const userId = req.user?.id || null;
    const collaborator = await Admin.findOne({
      include: [
        {
          model: Employer,
          as: "employer", // phải đúng với alias đã định nghĩa trong model
          where: {
            referral_code: referral_code, // lọc theo referral_code trong Employer
          },
        },
      ],
    });

    const savedBooking = await Booking.create({
      user_id: userId || null,
      note: note,
      referral_code: referral_code,
      tour_id: tour_id,
      front_image: frontImagePath,
      back_image: backImagePath,
      assigned_to: collaborator.id || null,
      status: 'confirmed',
      booking_date: new Date(),
    });
    res.status(200).json({
      success: true,
      message: 'Đặt tour thành công!',
      data: savedBooking,
    });
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};

// get single booking
export const getBooking = async (req, res) => {
  const id = req.params.id;

  try {
    const book = await Booking.findByPk(id);

    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found!" });
    }

    res.status(200).json({ success: true, message: "Successful!", data: book });
  } catch (error) {
    res.status(404).json({ success: false, message: "Not Found!" });
  }
};

// get all booking
export const getAllBooking = async (req, res) => {
  try {
    const books = await Booking.findAll();

    res
      .status(200)
      .json({ success: true, message: "Successful!", data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
};
