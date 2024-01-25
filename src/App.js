const express = require("express");
const configViewEngine = require('./config/viewEngine');
// const connection = require('./config/connectDB.js')
const initWebRoute = require('./router/web');
const initApiRoute = require('./router/api');
const homeController = require('./controller/homeController');
const path = require('path');

const app = express();
const bodyP=require("body-parser");
const compiler=require("compilex");
const options={stats: true };

app.use('/public', express.static(path.join(__dirname, 'src', 'public')));

app.use(express.urlencoded({    extended: true  }));
app.use(express.json());

const port = process.env.PORT || 5000;

// setup view engine
configViewEngine(app);

// init web route
initWebRoute(app);

// init api route
// initApiRoute(app);



compiler.init(options);




app.use(bodyP.json())
app.use("/codemirror-5.65.12", express.static("D:/Workspaces/Project III/codemirror-5.65.12"))

app.get("/", homeController.getHomepage);

app.get("/home/:token", homeController.checkRole);

app.get("/login", homeController.getLoginPage);

app.get("/signup", homeController.getSignupPage);

app.post("/create-new-user", homeController.createNewUser);

app.post("/check-login", homeController.login);

app.get("/user/:idUser", homeController.getUserPage);

app.post("/create-class", homeController.createClass);

app.post("/delete-class/:idClass", homeController.deleteClass);

app.get("/detail-class/:idClass", homeController.detailClass);

app.post("/add-students-to-class", homeController.addStudents);

app.post("/remove-student", homeController.removeStudent);

app.get("/detail-class/:idClass/exam", homeController.getExamPage);

app.get("/detail-class/:idClass/detail-exam/:idExam", homeController.getDetailExam);

app.get("/detail-class/:idClass/detail-user/:idUser", homeController.getDetailUser);

app.post("/upload-user/:idUser", homeController.uploadUser);

app.post("/delete-user", homeController.deleteUser);

app.post('/join-class', homeController.joinClass);

app.get('/student/:idUser/detail-class/:idClass', homeController.detailClassStudent);

app.get('/student/:idUser/detail-class/:idClass/members', homeController.membersClassStudent);

app.get('/student/:idUser/detail-class/:idClass/exam/:idTest', homeController.examStudent);

app.get('/student/:idUser/detail-class/:idClass/test', homeController.testStudent);

app.post('/student/test', homeController.checkTest);

app.get('/student/test/get-data/:idClass', homeController.getDataTest);

app.post('/submit', homeController.submit);

app.post('/leave-class', homeController.leaveClass);

app.post("/delete-exam", homeController.deleteExam);

app.get("/detail-class/:idClass/create-exam", homeController.getCreateNewExamPage);

app.post("/add-exam", homeController.addExam);

app.get('/detail-class/:idClass/test/create', homeController.getCreateTest);

app.post('/create-test', homeController.createTest);

app.get('/detail-class/:idClass/test/submission', homeController.getSubmission);

app.post('/grade/:idClass', homeController.grade);

app.post("/save-point", homeController.savePoint);

app.get("/user/:idUser/table-score", homeController.getTableScorePage);

app.get("/admin/classes", homeController.adminClasses);

app.get("/user/:idUser/test", homeController.getTestPage);

app.post("/save-code", homeController.saveCode);

app.get("/detail-class/:idClass/test", homeController.adminTest);

app.get("/:role/:idUser/profile", homeController.profileUser);

app.post("/change-password", homeController.changePassword);

app.post("/admin/delete-class/:idClass", homeController.deleteClass);

app.post("/admin/replace-lecturer/:idClass", homeController.replaceLecturer);

app.get("/admin/lecturers", homeController.LecturersPage);

app.get("/admin/students", homeController.StudentsPage);

app.get("/admin/:role/:idUser", homeController.detailUser);

app.post("/admin/delete-user/:idUser", homeController.deleteUser);

app.get("/admin/new-lecturer", homeController.newLecturerPage);

app.post("/admin/new-lecturer", homeController.newLecturer);

app.post("/admin/update-user/:idUser", homeController.uploadUser)

app.post("/compile", function (req, res) {
    var code = req.body.code
    var input = req.body.input
    var lang = req.body.lang
    try {

        if (input) console.log(input);

        if (lang == "Cpp") {
            if (!input) {
                var envData = { OS: "windows", cmd: "g++", options: { timeout: 10000 } }; // (uses g++ command to compile 
                compiler.compileCPP(envData, code, function (data) {
                    if (data.output) {
                        res.send(data);
                    }
                    else {
                        res.send({ output: "error" })
                    }
                });
            }
            else {
                var envData = { OS: "windows", cmd: "g++", options: { timeout: 10000 } }; // (uses g++ command to compile )
                compiler.compileCPPWithInput(envData, code, input, function (data) {
                    if (data.output) {
                        res.send(data);
                    }
                    else {
                        res.send({ output: "error" })
                    }
                });
            }
        }
        else if (lang == "Java") {
            if (!input) {
                var envData = { OS: "windows" };
                compiler.compileJava(envData, code, function (data) {
                    if (data.output) {
                        res.send(data);
                    }
                    else {
                        res.send({ output: "error" })
                    }
                })
            }
            else {
                //if windows  
                var envData = { OS: "windows" };
                //else
                compiler.compileJavaWithInput(envData, code, input, function (data) {
                    if (data.output) {
                        res.send(data);
                    }
                    else {
                        res.send({ output: "error" })
                    }
                })
            }
        }
        else if (lang == "Python") {
            if (!input) {
                var envData = { OS: "windows" };
                compiler.compilePython(envData, code, function (data) {
                    if (data.output) {
                        res.send(data);
                    }
                    else {
                        res.send({ output: "error" })
                    }
                });
            }
            else {
                var envData = { OS: "windows" };
                compiler.compilePythonWithInput(envData, code, input, function (data) {
                    if (data.output) {
                        res.send(data);
                    }
                    else {
                        res.send({ output: "error" })
                    }
                });
            }
        }
    }
    catch (e) {
        console.log("error")
    }
})

app.listen(5000, function(err) {
    if(err) console.log("Error in server setup");
    console.log('Server listening on PORT: ',port)
})