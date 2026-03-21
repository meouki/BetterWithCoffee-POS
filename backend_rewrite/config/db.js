const { Sequelize } = require('sequelize');
require('dotenv').config();

const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    // Resolve absolute path starting from this file's folder (backend_rewrite/config) 
    // going up two levels to the main PulsePoint folder
    storage: path.join(__dirname, '../../pos_data.sqlite'), 
    logging: false // Set to console.log for debugging SQL queries
});

module.exports = sequelize;
