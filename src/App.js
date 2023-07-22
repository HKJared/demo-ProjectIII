const express = require("express");
const configViewEngine = require('./config/viewEngine');
// const connection = require('./config/connectDB.js')
const initWebRoute = require('./router/web');
const initApiRoute = require('./router/api');
const homeController = require('./controller/homeController');

const app = express();
const bodyP=require("body-parser");
const compiler=require("compilex");
const options={stats: true };

app.use(express.urlencoded({    extended: true  }));
app.use(express.json());

// setup view engine
configViewEngine(app);

// init web route
initWebRoute(app);

// init api route
// initApiRoute(app);



compiler.init(options);




app.use(bodyP.json())
app.use("/codemirror-5.65.12", express.static("D:/Workspaces/Project II/codemirror-5.65.12"))

app.get("/", homeController.getHomepage);

app.get("/login", homeController.getLoginPage);

app.get("/signup", homeController.getSignupPage);

app.post("/create-new-user", homeController.createNewUser);

app.post("/check-login", homeController.checkLogin);

app.get("/user/:idUser", homeController.getUserPage);

app.get("/admin", homeController.getAdminPage);

app.get("/exam", homeController.getExamPage);

app.get("/detail/exam/:idExam", homeController.getDetailExam);

app.get("/detail/user/:idUser", homeController.getDetailUser);

app.post("/upload-user/:idUser", homeController.uploadUser);

app.post("/delete-user", homeController.deleteUser);

app.post("/delete-exam", homeController.deleteExam);

app.get("/creat-exam", homeController.getCreateNewExamPage);

app.post("/add-exam", homeController.addExam);

app.post("/save-point", homeController.savePoint);

app.get("/user/:idUser/table-score", homeController.getTableScorePage);

app.post("/admin/search", homeController.getSearchPage);

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

app.listen(5000)