module.exports = (sequelize, DataTypes) => {
    const order = sequelize.define("order", {
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
        timestamp: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
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
            type: DataTypes.STRING,
            allowNull: false
        },
        order_type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        cashier: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    order.associate = (models) => {
        order.hasMany(models.order_item, {
            foreignKey: 'order_id',
            as: 'items'
        });
    };

    return order;
};
