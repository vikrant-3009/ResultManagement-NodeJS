const moment = require('moment');

const bcrypt = require('bcryptjs');
const { validationResult } = require("express-validator");
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Teacher = require("../models/teacher.model");
const Student = require("../models/student.model");
const dobValidator = require('../util/dobValidator');

exports.getTeacherLogin = (req, res, next) => {
    res.status(200).render('teacher/login.teacher.ejs', { pageTitle: "Teacher Login", req });
}

exports.postTeacherLogin = (req, res, next) => {
    const errors = validationResult(req);
    let alert = [];

    if (!errors.isEmpty()) {
        alert = errors.array();
        res.status(401).render('teacher/login.teacher.ejs', { 
            pageTitle: "Teacher Login", 
            alert: alert, 
            req
        });
    }
    else {
        const teacherId = req.body.teacherId;
        const password = req.body.password;
        Teacher.findByPk(teacherId)
            .then(teacher => {
                if(teacher === null) {
                    alert.push({ msg: 'Invalid Credentials.' });
                    return res.status(401).render('teacher/login.teacher.ejs', { 
                        pageTitle: "Teacher Login", 
                        alert: alert, 
                        req
                    });
                }
                bcrypt.compare(password, teacher.password)
                    .then(doMatch => {
                        if(doMatch) {
                            // Create JWTs
                            const access_token = jwt.sign(
                                { "id": teacherId, 'role': 'teacher' },
                                process.env.ACCESS_TOKEN_SECRET,
                                { expiresIn: '1h' }
                            );
                            res.cookie('jwt', access_token, {
                                httpOnly: true,
                                sameSite: 'None',
                                secure: true
                            });
                            return res.status(200).redirect("/teacher/" + teacherId);
                        }
                        else {
                            alert.push({ msg: 'Invalid Password.' });
                            res.status(401).render('teacher/login.teacher.ejs', { 
                                pageTitle: "Teacher Login", 
                                alert: alert,
                                req
                            });
                        }
                    })
                    .catch(err => {
                        alert.push({ msg: 'Error in comparing password.' });
                        res.status(500).render('teacher/login.teacher.ejs', { 
                            pageTitle: "Teacher Login", 
                            alert: alert,
                            req 
                        });
                    })
            })
            .catch(err => {
                alert.push({ msg: 'Error' });
                res.status(500).render('teacher/login.teacher.ejs', { 
                    pageTitle: "Teacher Login", 
                    alert: alert,
                    req 
                });
            });
    }
}

exports.getTeacherDashboard = (req, res, next) => {
    const teacherId = req.id;
    const params_teacherId = req.params.teacherId;
    if(teacherId !== params_teacherId) {
        return res.status(401).send('You are not authorized to access this teacher\'s data.');
    }
    Student.findAll()
        .then(students => {     
            const studentsCount = students.length;
            res.render('teacher/dashboard.teacher.ejs', { 
                pageTitle: "Teacher Dashboard", 
                req: req,
                students: students,
                moment: moment,
                studentsCount: studentsCount,
            });
        })
        .catch(err => {
            res.status(404).json({ 'msg': "Error in getting teacher dashboard page" });
        });
}
    
exports.addNewResult = (req, res, next) => {
    const teacherId = req.id;
    const params_teacherId = req.params.teacherId;
    if(teacherId !== params_teacherId) {
        return res.status(401).send('You are not authorized to access this teacher\'s data.');
    }
    res.render('teacher/studentForm.teacher.ejs', { 
        pageTitle: "Add New Result",
        req,
        isEditing: false,
        isDeleting: false,
        isResult: false
    });
}

exports.postAddNewResult = (req, res, next) => {
    const teacherId = req.id;
    const params_teacherId = req.params.teacherId;
    if(teacherId !== params_teacherId) {
        return res.status(401).send('You are not authorized to access this teacher\'s data.');
    }
    const errors = validationResult(req);
    let alert = [];

    if(!errors.isEmpty()) {
        alert = errors.array();
        res.render('teacher/studentForm.teacher.ejs', { 
            pageTitle: "Add New Result", 
            alert,
            req,
            isEditing: false,
            isDeleting: false,
            isResult: false
        });
    }
    else {
        const roll_no = req.body.roll_no;
        const name = req.body.name;
        const dob = req.body.dob;
        const score = req.body.score;

        Student.findByPk(roll_no)
            .then(student => {
                if(student === null) {
                    const isDobCorrect = dobValidator.validateDob(dob);
                    if(!isDobCorrect) {
                        alert.push({ msg: 'Invalid Date of Birth.' });
                        res.render('teacher/studentForm.teacher.ejs', { 
                            pageTitle: "Add New Result", 
                            alert,
                            req,
                            isEditing: false,
                            isDeleting: false,
                            isResult: false
                        });
                    }
                    else {
                        Student.create({ 
                            rollno: roll_no,  
                            name: name,
                            dob: dob,
                            score: score
                        })
                        .then(result => {
                            res.status(201).redirect("/teacher/" + teacherId);
                        });
                    }
                }
                else {
                    alert.push({ msg: 'Roll No already exists.' });
                    res.render('teacher/studentForm.teacher.ejs', { 
                        pageTitle: "Add New Result", 
                        alert,
                        req,
                        isEditing: false,
                        isDeleting: false,
                        isResult: false
                    });
                }
            })
            .catch(err => {
                res.status(500).json({ 'msg': "Error in adding new result." });
            });
    }
}

exports.editResult = (req, res, next) => {
    const teacherId = req.id;
    const params_teacherId = req.params.teacherId;
    if(teacherId !== params_teacherId) {
        return res.status(401).send('You are not authorized to access this teacher\'s data.');
    }
    const roll_no = req.params.roll_no;
    Student.findByPk(roll_no)
        .then(student => {
            if(student !== null) {
                res.render('teacher/studentForm.teacher.ejs', { 
                    pageTitle: "Edit Result", 
                    req: req,
                    isEditing: true,
                    isDeleting: false,
                    isResult: false,
                    student: student,
                    moment: moment,
                    teacherId: teacherId
                });
            }
        })
        .catch(err => { 
            res.status(404).json({ 'msg': "Error in getting update result page" });
        });
}

exports.postEditResult = (req, res, next) => {
    const teacherId = req.id;
    const params_teacherId = req.params.teacherId;
    if(teacherId !== params_teacherId) {
        return res.status(401).send('You are not authorized to access this teacher\'s data.');
    }
    const roll_no = req.body.roll_no;
    const name = req.body.name;
    const dob = req.body.dob;
    const score = req.body.score;
    const errors = validationResult(req);
    let alert = [];
    const student = {
        rollno: roll_no,
        name: name,
        dob: dob,
        score: score
    };

    if(!errors.isEmpty()) {
        alert = errors.array();
        res.render('teacher/studentForm.teacher.ejs', { 
            pageTitle: "Edit Result", 
            alert,
            req,
            isEditing: true,
            isDeleting: false,
            isResult: false,
            student: student,
            moment: moment,
            teacherId: teacherId
        });
    }
    else {
        const isDobCorrect = dobValidator.validateDob(dob);
        if(!isDobCorrect) {
            alert.push({ msg: 'Invalid Date of Birth.' });
            res.render('teacher/studentForm.teacher.ejs', { 
                pageTitle: "Edit Result", 
                alert,
                req,
                isEditing: true,
                isDeleting: false,
                isResult: false,
                student: student,
                moment: moment,
                teacherId: teacherId
            });
        }
        else {
            Student.findByPk(roll_no)
                .then(studentDb => {
                    studentDb.name = name;
                    studentDb.dob = dob;
                    studentDb.score = score;
                    return studentDb.save()
                })
                .then(result => {
                    res.redirect("/teacher/" + teacherId);
                })
                .catch(err => { 
                    res.status(500).json({ 'msg': "Error in updating result." });
                });
        }
    }
}

exports.deleteResult = (req, res, next) => {
    const teacherId = req.id;
    const params_teacherId = req.params.teacherId;
    if(teacherId !== params_teacherId) {
        return res.status(401).send('You are not authorized to access this teacher\'s data.');
    }
    const roll_no = req.params.roll_no;
    Student.findByPk(roll_no)
        .then(student => {
            if(student !== null) {
                res.render('teacher/studentForm.teacher.ejs', { 
                    pageTitle: "Delete Result", 
                    req: req,
                    isEditing: false,
                    isDeleting: true,
                    isResult: false,
                    student: student,
                    moment: moment,
                    teacherId: teacherId
                });
            }
        })
        .catch(err => { 
            res.status(404).json({ 'msg': "Error in getting delete result page" });
        });
}

exports.postDeleteResult = (req, res, next) => {
    const teacherId = req.id;
    const params_teacherId = req.params.teacherId;
    if(teacherId !== params_teacherId) {
        return res.status(401).send('You are not authorized to access this teacher\'s data.');
    }
    const roll_no = req.params.roll_no;
    Student.findByPk(roll_no)
        .then(student => {
            return student.destroy();
        })
        .then(result => {
            res.redirect("/teacher/" + teacherId);
        })
        .catch(err => { 
            res.status(500).json({ 'msg': "Error in deleting result." });
        });
}