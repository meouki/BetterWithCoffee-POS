const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define('order', {
    id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
    subtotal: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    vat: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    total: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    payment_method: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    order_type: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    cashier: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    amount_tendered: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: null
    },
    change: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: null
    }
}, {
    tableName: 'orders'
});

module.exports = Order;
