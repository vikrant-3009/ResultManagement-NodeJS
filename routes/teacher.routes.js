const express = require('express');
const { check } = require("express-validator");

const teacherController = require('../controllers/teacher.controller');
const authJwtMiddleware = require('../middleware/authJwt.middleware');

const teacherRouter = express.Router();

teacherRouter.get("/", teacherController.getTeacherLogin);
    
teacherRouter.post("/", [
        check('teacherId', 'Invalid ID.')
            .exists()
            .isLength({ min: 5 }),
        check('password', 'Invalid Password')
            .exists()
            .isLength({ min: 6 })
    ], teacherController.postTeacherLogin);

teacherRouter.get("/:teacherId", authJwtMiddleware.verifyJwt('teacher'), teacherController.getTeacherDashboard);

teacherRouter.get("/:teacherId/add-student", authJwtMiddleware.verifyJwt('teacher'), teacherController.addNewResult);
    
teacherRouter.post("/:teacherId/add-student", [
        check("roll_no", "Roll No is required")
            .trim()
            .notEmpty(),
        check("name", "Name is required")
            .trim()
            .notEmpty(),
        check("dob", "Date of Birth is required")
            .trim()
            .notEmpty(),
        check("score", "Score must be between 0 to 100.")
            .trim()
            .exists()
            .isInt({ min: 0, max: 100 })
    ], authJwtMiddleware.verifyJwt('teacher'), teacherController.postAddNewResult);

teacherRouter.get("/:teacherId/edit-student/:roll_no", authJwtMiddleware.verifyJwt('teacher'), teacherController.editResult);

teacherRouter.post("/:teacherId/edit-student/:roll_no", [
        check("roll_no", "Roll No is required")
            .trim()
            .notEmpty(),
        check("name", "Name is required")
            .trim()
            .notEmpty(),
        check("dob", "Date of Birth is required")
            .trim()
            .notEmpty(),
        check("score", "Score must be between 0 to 100.")
            .trim()
            .exists()
            .isInt({ min: 0, max: 100 })
    ], authJwtMiddleware.verifyJwt('teacher'), teacherController.postEditResult);

teacherRouter.get("/:teacherId/delete-student/:roll_no", authJwtMiddleware.verifyJwt('teacher'), teacherController.deleteResult);

teacherRouter.post("/:teacherId/delete-student/:roll_no", authJwtMiddleware.verifyJwt('teacher'), teacherController.postDeleteResult);

module.exports = teacherRouter;