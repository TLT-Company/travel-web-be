import User from "./User.js";
import Admin from "./Admin.js";
import Customer from "./Customer.js";
import Employer from "./Employer.js";
import Tour from "./Tour.js";
import Booking from "./Booking.js";
import TaskAssignment from "./TaskAssignment.js";
import Task from "./Task.js";
import DocumentExportHistory from "./DocumentExportHistory.js";
import Document from "./Document.js";
import DocumentCustomer from "./DocumentCustomer.js";
import Permission from "./Permission.js";
import AdminPermission from "./AdminPermission.js";
import AddressMapping from "./AddressMapping.js";
import Migration from "./Migration.js";

// User relationships
User.hasOne(Customer, { foreignKey: "user_id", as: "customer" });
// User.hasMany(Booking, { foreignKey: "user_id", as: "bookings" });

// Admin relationships
Admin.hasOne(Employer, { foreignKey: "admin_id", as: "employer" });
Employer.belongsTo(Admin, { foreignKey: "admin_id", as: "admin" });

Admin.hasMany(Tour, { foreignKey: "created_by", as: "createdTours" });
Tour.belongsTo(Admin, { foreignKey: "created_by", as: "creator" });

Admin.hasMany(Booking, { foreignKey: "assigned_to", as: "assignedBookings" });
Booking.belongsTo(Admin, { foreignKey: "assigned_to", as: "assignedAdmin" });

// Customer relationships
Customer.belongsTo(User, { foreignKey: "user_id", as: "user" });
Customer.hasMany(Booking, { foreignKey: "customer_id", as: "bookings" });
// Booking.belongsTo(Customer, { foreignKey: "user_id", as: "user" });

// Tour relationships
Tour.hasMany(Booking, { foreignKey: "tour_id", as: "bookings" });
Booking.belongsTo(Tour, { foreignKey: "tour_id", as: "tour" });

// Task relationships
Task.hasMany(TaskAssignment, { foreignKey: "task_id", as: "taskAssignments" });
TaskAssignment.belongsTo(Task, { foreignKey: "task_id", as: "task" });

// Employer relationships
Employer.hasMany(TaskAssignment, {
  foreignKey: "employer_id",
  as: "taskAssignments",
});
TaskAssignment.belongsTo(Employer, {
  foreignKey: "employer_id",
  as: "employer",
});

// Booking relationships
Booking.hasMany(TaskAssignment, {
  foreignKey: "booking_id",
  as: "taskAssignments",
});
TaskAssignment.belongsTo(Booking, { foreignKey: "booking_id", as: "booking" });
Booking.belongsTo(Customer, { foreignKey: "customer_id", as: "customer" });

// Document relationships
Document.hasMany(DocumentCustomer, {
  foreignKey: "document_id",
  as: "documentCustomers",
});
DocumentCustomer.belongsTo(Document, {
  foreignKey: "document_id",
  as: "document",
});

// DocumentCustomer relationships
Customer.hasMany(DocumentCustomer, {
  foreignKey: "customer_id",
  as: "documentCustomers",
});
DocumentCustomer.belongsTo(Customer, {
  foreignKey: "customer_id",
  as: "customer",
});

// Permission relationships
Admin.belongsToMany(Permission, {
  through: AdminPermission,
  foreignKey: "admin_id",
  otherKey: "permission_id",
  as: "permissions",
});

Permission.belongsToMany(Admin, {
  through: AdminPermission,
  foreignKey: "permission_id",
  otherKey: "admin_id",
  as: "admins",
});

// AddressMapping relationships
AddressMapping.hasMany(Customer, {
  foreignKey: "address_mapping_id",
  as: "customers",
});

Customer.belongsTo(AddressMapping, {
  foreignKey: "address_mapping_id",
  as: "address_mapping",
});

export {
  User,
  Admin,
  Customer,
  Employer,
  Tour,
  Booking,
  Task,
  TaskAssignment,
  DocumentExportHistory,
  Document,
  DocumentCustomer,
  Permission,
  AdminPermission,
  AddressMapping,
  Migration,
};
