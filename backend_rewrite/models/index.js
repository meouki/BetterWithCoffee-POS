const sequelize = require('../config/db');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Inventory = require('./Inventory');
const Notification = require('./Notification');
const User = require('./User');
const Attendance = require('./Attendance');
const Category = require('./Category');
const ProductSize = require('./ProductSize');
const Recipe = require('./Recipe');
const StockLog = require('./StockLog');

// Define Associations
Category.hasMany(Product, { foreignKey: 'category_name', sourceKey: 'name', constraints: false });
Product.belongsTo(Category, { foreignKey: 'category_name', targetKey: 'name', constraints: false });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

OrderItem.belongsTo(Product, { foreignKey: 'product_id', onDelete: 'SET NULL' });
Product.hasMany(OrderItem, { foreignKey: 'product_id', onDelete: 'SET NULL' });

User.hasMany(Attendance, { foreignKey: 'user_id', as: 'attendance' });
Attendance.belongsTo(User, { foreignKey: 'user_id' });

Product.hasMany(ProductSize, { foreignKey: 'product_id', as: 'sizes', onDelete: 'CASCADE' });
ProductSize.belongsTo(Product, { foreignKey: 'product_id' });

Product.hasMany(Recipe, { foreignKey: 'product_id', as: 'recipes', onDelete: 'CASCADE' });
Recipe.belongsTo(Product, { foreignKey: 'product_id' });

ProductSize.hasMany(Recipe, { foreignKey: 'size_id', as: 'sizeRecipes', onDelete: 'SET NULL' });
Recipe.belongsTo(ProductSize, { foreignKey: 'size_id' });

Recipe.belongsTo(Inventory, { foreignKey: 'inventory_id', as: 'ingredient' });
Inventory.hasMany(Recipe, { foreignKey: 'inventory_id' });

Inventory.hasMany(StockLog, { foreignKey: 'inventory_id', as: 'logs', onDelete: 'CASCADE' });
StockLog.belongsTo(Inventory, { foreignKey: 'inventory_id' });

module.exports = {
    sequelize,
    Product,
    Order,
    OrderItem,
    Inventory,
    Notification,
    User,
    Attendance,
    Category,
    ProductSize,
    Recipe,
    StockLog
};
