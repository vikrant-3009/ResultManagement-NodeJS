const Sequalize = require('sequelize');

const sequelize = require('../database/MySql.database');

const Teacher = sequelize.define('teachers', {
    id: {
        type: Sequalize.STRING,
        allowNull: false,
        primaryKey: true
    },
    password: {
        type: Sequalize.STRING,
        allowNull: false
    }
});

module.exports = Teacher;