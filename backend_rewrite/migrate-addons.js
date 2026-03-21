const sequelize = require('./config/db');

async function migrate() {
    const queryInterface = sequelize.getQueryInterface();
    const table = 'products';

    console.log('--- Product Modifiers Migration ---');
    
    const columns = await queryInterface.describeTable(table);

    if (!columns.has_sugar_selector) {
        console.log('Adding column: has_sugar_selector');
        await queryInterface.addColumn(table, 'has_sugar_selector', {
            type: require('sequelize').DataTypes.BOOLEAN,
            defaultValue: false
        });
    }

    if (!columns.has_milk_selector) {
        console.log('Adding column: has_milk_selector');
        await queryInterface.addColumn(table, 'has_milk_selector', {
            type: require('sequelize').DataTypes.BOOLEAN,
            defaultValue: false
        });
    }

    if (!columns.addons) {
        console.log('Adding column: addons');
        await queryInterface.addColumn(table, 'addons', {
            type: require('sequelize').DataTypes.TEXT,
            defaultValue: '[]'
        });
    }

    console.log('✅ Migration complete.');
    process.exit(0);
}

migrate().catch(err => {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
});
