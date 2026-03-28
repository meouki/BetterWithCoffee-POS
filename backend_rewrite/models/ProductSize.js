const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProductSize = sequelize.define('product_size', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    price_adjustment: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'product_sizes',
    indexes: [
        {
            unique: true,
            fields: ['product_id', 'name']
        }
    ]
});

module.exports = ProductSize;
