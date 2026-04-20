'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // SQLite doesn't support DROP COLUMN directly in older versions, 
    // but Sequelize usually handles it by recreating the table if needed.
    // However, given this is SQLite and we want to be safe:
    try {
      await queryInterface.removeColumn('products', 'has_milk_selector');
    } catch (err) {
      console.warn('Column has_milk_selector already removed or does not exist');
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('products', 'has_milk_selector', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
  }
};
