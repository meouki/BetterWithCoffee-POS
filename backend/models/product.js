module.exports = (sequelize, DataTypes) => {
    const product = sequelize.define("product", {
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: [['Cold Drinks', 'Hot Drinks', 'Blended Drinks', 'Frappe Drinks', 'Pastries']]
            }
        },
        base_price: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        is_available: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        image_url: {
            type: DataTypes.STRING,
            allowNull: true
        },
        modifiers: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    });

    return product;
};