const path = require('path');

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const sequelize = require('./database/MySql.database');
const Teacher = require('./models/teacher.model');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const teacherRoutes = require('./routes/teacher.routes');
const studentRoutes = require('./routes/student.routes');
const logoutRouter = require('./routes/logout.route');

app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res, next) => {
    res.render('index.ejs', { pageTitle: 'Landing Page', req });
});

app.use('/teacher', teacherRoutes);
app.use('/student', studentRoutes);
app.use(logoutRouter);

sequelize
    // .sync({ force: true })
    .sync()
    .then(res => {
        return Teacher.findAll();
    })
    .then(teachers => {
        if(teachers.length === 0) {
            const teacherId = 'fc101';
            const password = 'abc@123';
            return bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    return Teacher.create({
                        id: teacherId,
                        password: hashedPassword
                    });
                })
        }
        return teachers;
    })
    .then(res => {
        app.listen(3000);
    })
    .catch(err => {
        console.log('error: ', err)
    });
