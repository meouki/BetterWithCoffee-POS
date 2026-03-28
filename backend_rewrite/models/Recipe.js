const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Recipe = sequelize.define('recipe', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    size_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    inventory_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
}, {
    tableName: 'recipes',
    indexes: [
        {
            unique: true,
            fields: ['product_id', 'size_id', 'inventory_id']
        }
    ]
});

module.exports = Recipe;
