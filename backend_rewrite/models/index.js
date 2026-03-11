const sequelize = require('../config/db');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Inventory = require('./Inventory');
const Notification = require('./Notification');

// Define Associations
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

OrderItem.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasMany(OrderItem, { foreignKey: 'product_id' });

module.exports = {
    sequelize,
    Product,
    Order,
    OrderItem,
    Inventory,
    Notification
};
