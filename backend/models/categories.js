module.exports = (sequelize, DataTypes) => {
    const categories = sequelize.define ("categories", {
        categories_id:{
            type: DataTypes.INTEGER,
            allownull: false,
            primaryKey: true
        },
         name:{
            type: DataTypes.STRING,
            allownull: false
        },
    });

    return categories;
};