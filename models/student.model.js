const Sequalize = require('sequelize');

const sequelize = require('../database/MySql.database');

const Student = sequelize.define('students', {
    rollno: {
        type: Sequalize.STRING,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequalize.STRING,
        allowNull: false
    },
    dob: {
        type: Sequalize.DATEONLY,
        allowNull: false
    },
    score: {
        type: Sequalize.INTEGER,
        allowNull: false
    }
});

module.exports = Student;