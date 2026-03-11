const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('product', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    base_price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    is_available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    modifiers: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    image_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        defaultValue: null
    }
}, {
    tableName: 'products'
});

module.exports = Product;
