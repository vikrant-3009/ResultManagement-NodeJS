const express = require('express');
const { check } = require('express-validator');

const authJwtMiddleware = require('../middleware/authJwt.middleware');
const studentController = require('../controllers/student.controller.js');

const studentRouter = express.Router();

studentRouter.get("/", studentController.getStudentLogin);

studentRouter.post("/", [
    check('roll_no', 'Roll No is required')
    .trim()
    .notEmpty(),
    check('dob', 'Date of Birth is required')
    .trim()
    .notEmpty()
], studentController.postStudentLogin);

studentRouter.get("/:roll_no", authJwtMiddleware.verifyJwt('student'), studentController.getStudentResult);

module.exports = studentRouter;