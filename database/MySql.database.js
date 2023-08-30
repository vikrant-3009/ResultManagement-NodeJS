const Sequelize = require('sequelize');

const sequelize = new Sequelize('rms_node', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql'
});

module.exports = sequelize;