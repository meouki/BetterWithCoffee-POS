const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Attendance = sequelize.define('attendance', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    clock_in: {
        type: DataTypes.DATE,
        allowNull: true
    },
    clock_out: {
        type: DataTypes.DATE,
        allowNull: true
    },
    type: {
        type: DataTypes.ENUM('Work', 'DayOff'),
        defaultValue: 'Work'
    }
}, {
    tableName: 'attendance',
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'date']
        }
    ]
});

module.exports = Attendance;
