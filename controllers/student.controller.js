const moment = require('moment');

const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Student = require('../models/student.model');

exports.getStudentLogin = (req, res, next) => {
    res.render('student/login.student.ejs', { 
        pageTitle: "Student Login",
        req 
    });
}

exports.postStudentLogin = (req, res, next) => {
    const errors = validationResult(req);
    let alert = [];

    if(!errors.isEmpty()) {
        alert = errors.array();
        res.status(401).render('student/login.student.ejs', { 
            pageTitle: "Student Login",
            alert,
            req
        });
    }
    else {
        const roll_no = req.body.roll_no;
        const dob = req.body.dob;
        Student.findByPk(roll_no)
            .then(student => {
                if(student === null) {
                    alert.push({ msg: 'Invalid Credentials.' });
                    res.status(401).render('student/login.student.ejs', { 
                        pageTitle: "Student Login", 
                        alert, 
                        req
                    });
                }
                else {
                    if(student.dob === dob) {
                        // Create JWTs
                        const access_token = jwt.sign(
                            { 'id': roll_no, 'role': 'student' },
                            process.env.ACCESS_TOKEN_SECRET,
                            { expiresIn: '30m' }
                        );
                        res.cookie('jwt', access_token, {
                            httpOnly: true,
                            sameSite: 'None',
                            secure: true
                        });
                        res.redirect('/student/' + roll_no);
                    }
                    else {
                        alert.push({ msg: 'Invalid Credentials.' });
                        res.status(401).render('student/login.student.ejs', { 
                            pageTitle: "Student Login", 
                            alert,
                            req
                        });
                    }
                }
            })
            .catch(err => {
                res.status(500).json({ 'msg': "Error in validating student." });
            });
    }
}

exports.getStudentResult = (req, res, next) => {
    const roll_no = req.id;
    const params_roll_no = req.params.roll_no;
    if(roll_no !== params_roll_no) {
        return res.status(401).send('You are not authorized to access this student\'s data.');
    }
    Student.findByPk(roll_no)
        .then(student => {
            res.render('teacher/studentForm.teacher.ejs', {
                pageTitle: 'Student Result',
                req,
                isResult: true,
                isEditing: false,
                isDeleting: false,
                student: student,
                moment: moment
            });
        })
        .catch(err => { 
            res.status(404).json({ 'msg': "Error in fetching result." });
        });
}