import Document from "../models/Document.js";
import DocumentCustomer from "../models/DocumentCustomer.js";
import Customer from "../models/Customer.js"
import { Op, Sequelize } from "sequelize";

// Get all document
export const getAllDocuments = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const pageSize = req.query.limit ? parseInt(req.query.limit) : 20;
    const offset = (page - 1) * pageSize;
    const whereCondition = buildDocumentFilter(req.query);

    const documents = await Document.findAll({
        attributes: [
          'id',
          'document_number',
          [Sequelize.fn('MIN', Sequelize.col('Document.created_at')), 'created_at'],
          [Sequelize.fn('COUNT', Sequelize.col('documentCustomers.customer_id')), 'customer_count'],
        ],
        include: [
          {
            model: DocumentCustomer,
            as: 'documentCustomers',
            attributes: [],
          },
        ],
        where: whereCondition,
        group: ['document_number','id'],
        raw: true,
    });

    const count = documents.length

    const sorted = documents.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const paged = sorted.slice(offset, offset + pageSize);

    res.status(200).json({
      success: true,
      count: count,
      message: "Successfully Get all documents",
      data: paged,
    });
  } catch (error) {
    console.error("Get all documents error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get all documents",
    });
  }
};

//Get single Document
export const getSingleDocument = async (req, res) => {
   const document_id = req.params.id
   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 20;
   const offset = (page - 1) * limit;
   const whereCondition = buildCustomerFilter(req.query);

   try {
      const {rows, count} = await Customer.findAndCountAll({
        include: [{
          model: DocumentCustomer,
          required: true,
          as: "documentCustomers",
          attributes: [],
          where: {
              document_id: document_id
          }
        }],
        where: whereCondition,
        order: [['created_at', 'DESC']],
        raw: true,
      });

      const customers = rows.slice(offset, offset + limit);

      res.status(200).json({ success: true, count: count, message: 'Successfully', data: customers })
   } catch (error) {
      console.error("Get single document customers error:", error);
      res.status(404).json({ success: false, message: 'Not Found' })
   }
}

const buildDocumentFilter = (query) => {
  const {
    document_number, start_date, end_date
  } = query;

  const where = {};

  if (document_number) {
    where.document_number = { [Op.like]: `%${document_number}%`}
  }

  if (start_date && end_date) {
    where.created_at = { [Op.between]: [start_date, end_date] };
  }

  return where;
}

const buildCustomerFilter = (query) => {
  const {
    card_id, full_name
  } = query;

  const where = {};

  if (card_id) {
    where.card_id = { [Op.like]: `%${card_id}%`}
  }

  if (full_name) {
    where.full_name = { [Op.like]: `%${full_name}%`};
  }

  return where;
}

export const addCustomerToDocument = async (req, res) => {
    try {
      const card_id = req.body.card_id;
      const document_id = req.params.id;

      if (!card_id) {
        return res.status(400).json({ message: "Thiếu ID thẻ" });
      }

      if (!document_id) {
        return res.status(400).json({ message: "Thiếu số thông hành" });
      }

      console.log(document_id)

      // find customer by card_id
      let customer = await Customer.findOne({ where: { card_id: card_id } });

      // find document by document_id
      const document = await Document.findByPk(document_id)

      if (!document) {
        return res.status(404).json({ message: "không tồn tại số thông hành "});
      }

      if (customer) {
        // check exits customer in Document
        const exists = await DocumentCustomer.findOne({
          where: {
            customer_id: customer.id,
            document_id: document.id,
          },
        });

        if (exists) {
          return res.status(409).json({message: "Khách hàng có CCCD " + card_id + " đã tồn tại trong số thông hành " + document.document_number})
        }

        customer = await customer.update(req.body);
      } else {
        customer = await Customer.create(req.body);
      }

      if (customer.id) {
        await DocumentCustomer.create({
          document_id: document.id,
          customer_id: customer.id
        })
      }

      res.status(200).json({ success: true, message: 'Successfully created', data: customer })
    } catch (error) {
        console.error("create customers error:", error);
        res.status(500).json({ success: true, message: 'Đã xảy ra lỗi. Vui lòng thử lại sau!' })
    }
}

//Get single Customer
export const getSingleCustomer = async (req, res) => {
   try {
      const { customer_id } = req.params;

      const customer = await Customer.findByPk(customer_id);

      if (!customer) {
        return res.status(404).json({
          status: "error",
          message: "Không tìm thấy khách hàng",
        });
      }

      res.status(200).json({ success: true, count: 1, message: 'Successfully', data: customer })
   } catch (error) {
      console.error("Get single document customers error:", error);
      res.status(404).json({ success: false, message: 'Not Found' })
   }
}

//update Customer
export const updateCustomer = async (req, res) => {
   try {
      const { customer_id } = req.params;

      const customer = await Customer.findByPk(customer_id);

      if (!customer) {
        return res.status(404).json({
          status: "error",
          message: "Không tìm thấy khách hàng",
        });
      }

      customer.card_id = req.body.card_id;
      customer.full_name = req.body.full_name;
      customer.day_of_birth = req.body.day_of_birth;
      customer.gender = req.body.gender;
      customer.national = req.body.national;
      customer.place_of_birth = req.body.place_of_birth;
      customer.village = req.body.village;
      customer.card_created_at = req.body.card_created_at;
      customer.province = req.body.province;
      customer.district = req.body.district;
      customer.commune = req.body.commune;

      const editcustomer = await customer.save();
      res.status(200).json({ success: true, count: 1, message: 'Successfully', data: editcustomer })
   } catch (error) {
      console.error("Get single document customers error:", error);
      res.status(500).json({ success: false, message: 'Đã xảy ra lỗi. Vui lòng thử lại sau!' })
   }
}

export const deleteCustomer = async (req, res) => {
   try {
    const {id, customer_id} = req.params;


    const document_customer = await DocumentCustomer.findOne({
      where: {
      document_id: id,
      customer_id: customer_id
      }
    });

    if (!document_customer) {
      return res.status(404).json({ message: 'Không tìm thấy customer' });
    }

    await document_customer.destroy();

    return res.status(200).json({ message: 'Xóa thành công khách hàng' });
  } catch (error) {
    console.error('Lỗi xóa:', error);
    return res.status(500).json({ message: 'Lỗi server khi xóa' });
  }
}