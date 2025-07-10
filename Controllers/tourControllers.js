import { Tour, Booking, Admin, Customer } from "../models/index.js"
import { Op } from "sequelize";

//Create new tour
export const createTour = async (req, res) => {
   const newTour = new Tour(req.body)

   try {
      const savedTour = await newTour.save()

      res.status(200).json({ success: true, message: 'Successfully created', data: savedTour })
   } catch (error) {
      res.status(500).json({ success: true, message: 'Failed to create. Try again!' })
   }
}

//Update Tour
export const updateTour = async (req, res) => {
   const id = req.params.id

   try {
      const updatedTour = await Tour.findByIdAndUpdate(id, {
         $set: req.body
      }, { new: true })

      res.status(200).json({ success: true, message: 'Successfully updated', data: updatedTour })
   } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update' })
   }
}

//Delete Tour
export const deleteTour = async (req, res) => {
   const id = req.params.id

   try {
      await Tour.findByIdAndDelete(id)

      res.status(200).json({ success: true, message: 'Successfully deleted' })
   } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to delete' })
   }
}

//Get single Tour
export const getSingleTour = async (req, res) => {
   const id = req.params.id

   try {
      const tour = await Tour.findOne({
         where: { id: id },
         include: [{
            model: Booking,
            as: "bookings",
            include: [
               {
                  model: Customer,
                  as: "customer",
                  attributes: ["id", "full_name"],
               },
               {
                  model: Admin,
                  as: "assignedAdmin",
                  attributes: ["id", "username"],
               },
            ],
            order: [["createdAt", "DESC"]],
         }],
      });

      res.status(200).json({ success: true, message: 'Successfully', data: tour })
   } catch (error) {
      res.status(404).json({ success: false, message: 'Not Found' })
   }
}

//Get All Tour
export const getAllTour = async (req, res) => {
   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 20;
   const offset = (page - 1) * limit;
   const whereCondition = buildTourFilter(req.query);

   try {
      const { rows: tours, count } = await Tour.findAndCountAll({
         where: whereCondition,
         offset,
         limit,
      });

      res.status(200).json({
         success: true,
         count: count,
         message: 'Successfully',
         data: tours
      })
   } catch (error) {
      res.status(404).json({ success: false, message: 'Not Found' })
   }
}

const buildTourFilter = (query) => {
   const {
      name, location, price_min, price_max, start_date, end_date
   } = query;

   const where = {};

   if (name) {
      where.name = { [Op.like]: `%${name}%`}
   }

   if (location) {
      where.location = { [Op.like]: `%${location}%`}
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

   return where;
}

// Get tour by search
export const getTourBySearch = async (req, res) => {
   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 20;
   const offset = (page - 1) * limit;
   const whereCondition = buildTourFilter(req.query);

   try {
      const { rows: tours, count } = await Tour.findAndCountAll({
         where: whereCondition,
         offset,
         limit,
      });

      res.status(200).json({
         success: true,
         count: count,
         message: 'Successfully',
         data: tours
      })
   } catch (error) {
      res.status(404).json({ success: false, message: 'Not Found' })
   }
}

//Get featured Tour
export const getFeaturedTour = async (req, res) => {
   //console.log(page)

   try {
      const tours = await Tour.find({ featured: true }).populate('reviews').limit(8)

      res.status(200).json({ success: true, message: 'Successfully', data: tours })
   } catch (error) {
      res.status(404).json({ success: false, message: 'Not Found' })
   }
}

//Get tour count 
export const getTourCount = async(req,res) => {
   try {
      const tourCount = await Tour.estimatedDocumentCount()

      res.status(200).json({success:true, data:tourCount})
   } catch (error) {
      res.status(500).json({success:false, message: "Failed to fetch"})
   }
}