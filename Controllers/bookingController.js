import Admin from "../models/Admin.js";
import Customer from "../models/Customer.js";
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
    const pictureAvatarPath = req.files?.picture_avatar?.[0]?.path || null;

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

    // const customer = await Customer.findOne({
    //   where: { card_id: cccd },
    // });
    // if (customer) {
    //   await Customer.update(
    //     {
    //       user_id: userId,
    //       id_card_front: frontImagePath,
    //       id_card_back: backImagePath,
    //       picture: pictureAvatarPath,
    //       verified_status: 'verified',
    //     },
    //     {
    //       where: { card_id: cccd },
    //     }
    //   );
    // }else {
    //   await Customer.create({
    //     user_id: userId,
    //     card_id: cccd,
    //     id_card_front: frontImagePath,
    //     id_card_back: backImagePath,
    //     picture: pictureAvatarPath,
    //     verified_status: 'verified'
    //   });
    // }

    const savedBooking = await Booking.create({
      customer_id: req.user?.customer_id || null,
      note: note,
      referral_code: referral_code,
      tour_id: tour_id,
      assigned_to: collaborator?.id || null,
      front_image: frontImagePath,
      back_image: backImagePath,
      picture_avatar: pictureAvatarPath,
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
