const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const StockLog = sequelize.define('stock_log', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    inventory_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    change_qty: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    reason: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    reference_id: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    stock_after: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'stock_logs'
});

module.exports = StockLog;
