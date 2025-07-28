import express from 'express'
import { createBooking, getAllBooking, getBooking } from '../Controllers/bookingController.js'
import { verifyAdmin, verifyUser } from '../utils/verifyToken.js'
import { upload } from '../middlewares/upload.js';
import multer from 'multer';

const router = express.Router();
router.post(
  '/', verifyUser,
  upload.fields([
    { name: 'front_image', maxCount: 1 },
    { name: 'back_image', maxCount: 1 },
    { name: 'picture_avatar', maxCount: 1 },
  ]),
  createBooking
);
router.get('/:id', verifyUser, getBooking)
router.get('/', verifyAdmin, getAllBooking)

export default router