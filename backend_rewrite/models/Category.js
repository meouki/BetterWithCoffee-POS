const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Category = sequelize.define('category', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'categories'
});

module.exports = Category;
