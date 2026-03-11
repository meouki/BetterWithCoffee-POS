module.exports = (sequelize, DataTypes) => {
    const order_item = sequelize.define("order_item", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        order_id: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'orders',
                key: 'id'
            }
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'products',
                key: 'product_id'
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        snapshot_price: {
            type: DataTypes.FLOAT,
            allowNull: false
        }
    });

    order_item.associate = (models) => {
        order_item.belongsTo(models.order, {
            foreignKey: 'order_id'
        });
    };

    return order_item;
};
