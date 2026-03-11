const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Notification = sequelize.define('notification', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    type: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    details: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    cashier: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
}, {
    tableName: 'notifications'
});

module.exports = Notification;
