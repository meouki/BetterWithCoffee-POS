const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const OrderItem = sequelize.define('order_item', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    order_id: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    original_price: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    modifiers: {
        type: DataTypes.TEXT,
        defaultValue: '[]',
        get() {
            const rawValue = this.getDataValue('modifiers');
            if (!rawValue) return [];
            try { return typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue; } 
            catch (e) { return []; }
        },
        set(value) {
            const finalValue = typeof value === 'string' ? value : JSON.stringify(value || []);
            this.setDataValue('modifiers', finalValue);
        }
    }
}, {
    tableName: 'order_items'
});

module.exports = OrderItem;
