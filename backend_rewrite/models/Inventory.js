const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Inventory = sequelize.define('inventory', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    stock: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: false
    },
    unit: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    threshold: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: false
    },
    last_updated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'inventory'
});

module.exports = Inventory;
