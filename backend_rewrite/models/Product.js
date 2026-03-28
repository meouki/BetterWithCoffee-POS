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
    has_sizes: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    modifiers: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    has_sugar_selector: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    has_milk_selector: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    addons: {
        type: DataTypes.TEXT,
        defaultValue: '[]',
        get() {
            const rawValue = this.getDataValue('addons');
            if (!rawValue) return [];
            try {
                return typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
            } catch (e) {
                console.error('Failed to parse addons:', rawValue);
                return [];
            }
        },
        set(value) {
            // If already a string (from FormData/Multer), use as is, else stringify
            const finalValue = typeof value === 'string' ? value : JSON.stringify(value || []);
            this.setDataValue('addons', finalValue);
        }
    },
    is_archived: {
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
