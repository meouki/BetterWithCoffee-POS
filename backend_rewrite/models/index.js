const sequelize = require('../config/db');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Inventory = require('./Inventory');
const Notification = require('./Notification');
const User = require('./User');
const Attendance = require('./Attendance');
const Category = require('./Category');

// Define Associations
Category.hasMany(Product, { foreignKey: 'category_name', sourceKey: 'name', constraints: false });
Product.belongsTo(Category, { foreignKey: 'category_name', targetKey: 'name', constraints: false });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

OrderItem.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasMany(OrderItem, { foreignKey: 'product_id' });

User.hasMany(Attendance, { foreignKey: 'user_id', as: 'attendance' });
Attendance.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
    sequelize,
    Product,
    Order,
    OrderItem,
    Inventory,
    Notification,
    User,
    Attendance,
    Category
};
