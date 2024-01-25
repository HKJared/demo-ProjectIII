const { render } = require('ejs');
const pool = require('../config/connectDB');
const { secretKey } = require("../config/JWT");
const jwt = require("jsonwebtoken");
const { jwtDecode } = require('jwt-decode');

let getHomepage = async (req, res) => {

    return res.render('index.ejs');
    
}

let checkRole = async (req, res) => {
    const token = req.params.token
    const decoded = jwtDecode(token)
    if (decoded.role == "admin") {
    const [rows, fields] = await pool.execute('select * from user where role = "user"');
    

    return res.render('admin.ejs', {    data: rows  });
    } 
    else {
        if (decoded.role == "student") {
            const idUser = decoded.idUser

            const [rows, fields] = await pool.execute('select c.* from classes as c, classmembers as cm where cm.idUser = ? and cm.idClass = c.idClass', [idUser])
            

            return res.render('user/students/home.ejs', {   data: rows, idUser: idUser  })
        } else {
            var data = []
            const [rows, fields] = await pool.execute('select * from classes where idLecturer = ?', [decoded.idUser]);
            data = rows;

            for (let i = 0; i<rows.length; i++) {
            const [rows2, fields2] = await pool.execute('SELECT COUNT(idUser) AS totalMembers FROM classMembers WHERE idClass = ?', [rows[i].idClass]);
                data[i].totalMembers = rows2[0].totalMembers;
            }

            return res.render('user/lecturers/home.ejs', {    data: data, idUser: decoded.idUser  });
        }
    }
}

let detailClassStudent = async (req, res) => {
    const idUser = req.params.idUser
    const idClass = req.params.idClass

    const [rows, fields] = await pool.execute('select * from classes where idClass = ?', [idClass])
    const [rows2, fields2] = await pool.execute('select e.*, c.point from exam as e, code as c where e.idClass = ? and c.idTest = e.idTest', [idClass])

    return res.render('user/students/detailClass.ejs', {  detail: rows[0], idUser: idUser, data: rows2 })
}

let joinClass = async (req, res) => {
    const idUser = req.body.idUser;
    const idClass = req.body.idClass;

    const [rows, fields] = await pool.execute('select * from classes where idClass = ?', [idClass])

    if (rows.length == 0) {
        return res.status(400).json('Class does not exist')
    } else {
        const [rows2, fields2] = await pool.execute('select * from classMembers where idUser = ? and idClass = ?', [idUser, idClass])

        if (rows2.length == 0) {
            await pool.execute('insert into classMembers (idClass, idUser) values (?, ?)', [idClass, idUser])
        }
        return res.status(200).json('Joined')
    }
}

let membersClassStudent = async (req, res) => {
    const idUser = req.params.idUser
    const idClass = req.params.idClass

    const [rows, fields] = await pool.execute('select * from classes where idClass = ?', [idClass])
    const [rows2, fields2] = await pool.execute('select * from user where idUser = ?', [rows[0].idLecturer])
    const [rows3, fields3] =await pool.execute('select cm.*, u.fullname from classMembers as cm, user as u where cm.idClass = ? and cm.idUser = u.idUser', [idClass]);

    return res.render('user/students/membersClass.ejs', {   detail: rows[0], lecturer: rows2[0], data: rows3, idUser: idUser})
}

let examStudent = async (req, res) => {
    const idUser = req.params.idUser;
    const idClass = req.params.idClass;
    const idTest = req.params.idTest;

    const [rows, fields] = await pool.execute('select * from classes where idClass = ?', [idClass])
    const [rows2, fields2] = await pool.execute('select * from exam where idTest = ?', [idTest])
    const [rows3, fields3] = await pool.execute('select * from test_case where idTest = ?', [idTest])

    return res.render('user/students/exam.ejs', {   detail: rows[0], data: rows2[0], idUser: idUser, arrTest_case: rows3})
}

let checkTest = async (req, res) => {
    const idUser = req.body.idUser;
    const idClass = req.body.idClass;

    const [rows2, fields2] = await pool.execute('select * from submition where idUser = ? and idClass = ?', [idUser, idClass])

    if (rows2.length != 0) {
        rows2[0].submited_at = (new Date(rows2[0].submited_at)).toLocaleString();
        return res.status(201).json('You submitted at: ' + rows2[0].submited_at + '\nYour point: ' + rows2[0].point)
    }

    const [rows, fields] = await pool.execute('select * from test where idClass = ?', [idClass])

    var currentTime = new Date();

    var startTime = new Date(rows[0].start_time);
    var endTime = new Date(rows[0].end_time);

    currentTime.setHours(0, 0, 0, 0);
    startTime.setHours(0, 0, 0, 0);
    endTime.setHours(0, 0, 0, 0);

    if (currentTime.getTime() < startTime.getTime || currentTime.getTime() > endTime.getTime()) {
        return res.status(401).json('Test not available')
    } else {
        return res.status(200).json('Test available')
    }
}

let testStudent = async (req, res) => {
    const idUser = req.params.idUser;
    const idClass = req.params.idClass;

    const [rows, fields] = await pool.execute('select * from classes where idClass = ?', [idClass])
    const [rows2, fields2] = await pool.execute('select testName, start_time, end_time, duration, languageAllow from test where idClass = ?', [idClass])

    return res.render('user/students/test.ejs', {   detail: rows[0], data: rows2[0], idUser: idUser })
}

let getDataTest = async (req, res) => {
    try {
        const idClass = req.params.idClass;

        const [rows, fields] = await pool.execute('select testDetail, image from test where idClass = ?', [idClass])

        return res.status(200).json(rows[0])
    } catch (error) {
        console.error('Server error: ', error)
        return res.status(500).json('Server error!')
    }
}

let submit = async (req, res) => {
    try {
        const idUser = req.body.idUser;
        const idClass = req.body.idClass;
        const code = req.body.code;
        const lang = req.body.lang;

        const [rows, fields] = await pool.execute('select * from submition where idUser = ? and idClass = ?', [idUser, idClass])

        if (rows.length == 0) {
            const [rows2, fields2] = await pool.execute('select testId from test where idClass = ?', [idClass]);

            await pool.execute('insert into submition (idUser, idClass, code, lang, testId) values (?, ?, ?, ?, ?)', [idUser, idClass, code, lang, rows2[0].testId])
        }

        return res.status(200).json('Submitted')
    } catch (error) {
        console.error('Server error: ', error);
        return res.status(404).json('Server error')
    }
}

let getLoginPage = async (req, res) => { 

    return res.render('login.ejs');
    
}

let getSignupPage = async (req, res) => {
    let [rows, fields] = await pool.execute('select * from user')
    const checkUser = []
    for (let i = 0; i< rows.length; i++) {
        checkUser[i] = rows[i].account
    }
    var accUser = JSON.parse(JSON.stringify(Object.assign({}, checkUser)));
    res.render('signup.ejs', {  dataCheck: accUser });
    
}

let login = async (req, res) => {
    let {   account, password } = req.body;

    try {
        if (account === "" || password === "") {
            return res.status(400).json("Invalid input");
        }
        else {
            let [rows, fields] = await pool.execute('select  * from user where account = ? and password = ?', [account, password]);
            if (rows.length == 0) {
                return res
                    .status(400)
                    .json("Wrong email or password. Please try again");
            }
            else {
                const idUser = rows[0].idUser;
                const role = rows[0].role;
                const token = jwt.sign({    idUser: idUser, role: role  }, secretKey, { expiresIn: "12h"   });
                return res.status(200).json({ jwt: token });
            }
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json("Internal Server Error");
    }

}

let createNewUser = async (req, res) => {
    let {   fullname, account, password } = req.body;

    let [rows, fields] = await pool.execute('select  * from user where account = ?', [account]);


    if (rows.length == 0) {
        await pool.execute('insert into user (account, password, fullname, role) values (?, ?, ?, "student")',
            [account, password, fullname]);

        return res.status(200).json('Account successfully created')

    }
    else {
        return res.status(201).json('Account already exists')
    }
}

let getUserPage = async (req, res) => {
    let id = req.params.idUser;

    const [rows, fields] = await pool.execute('select * from exam'); //create deatailExam array
    const idExam = [], detail = [], languageAllow = []
    for (let i = 0; i<rows.length; i++) {
        idExam[i] = rows[i].idTest;
        detail[i] = rows[i].detail;
        languageAllow[i] = rows[i].languageAllow ;
    }
    var examId = JSON.parse(JSON.stringify(Object.assign({}, idExam)));  
    var detailExam = JSON.parse(JSON.stringify(Object.assign({}, detail)));
    var languageAllowExam = JSON.parse(JSON.stringify(Object.assign({}, languageAllow)));

    const [rows3, fields3] = await pool.execute('select * from test_case'); //create test_case array
    const idTest = [], input = [], output = [];
    for (let i = 0; i<rows3.length; i++) {
        idTest[i] = rows3[i].idTest;
        input[i] = rows3[i].input;
        output[i] = rows3[i].output
    }
    var testId = JSON.parse(JSON.stringify(Object.assign({}, idTest)));  
    var testInput = JSON.parse(JSON.stringify(Object.assign({}, input)));
    var testOutput = JSON.parse(JSON.stringify(Object.assign({}, output)));

    return res.render('user.ejs', {     
        dataId: id,
        dataExam: rows,
        examId: examId,
        detailExam: detailExam,
        languageAllowExam : languageAllowExam,
        testId: testId,
        testInput: testInput,
        testOutput: testOutput
    })
}

let adminClasses = async (req, res) => {
    const [rows, fields] = await pool.execute('select c.*, u.fullname as lecturer from classes as c, user as u where c.idLecturer = u.idUser')
    for (let i = 0; i < rows.length; i++) {
        const [rows2, fields2] = await pool.execute('SELECT COUNT(idUser) AS totalMembers FROM classMembers WHERE idClass = ?', [rows[i].idClass]);
        rows[i].totalMembers = rows2[0].totalMembers;
    }
    return res.render('admin/classes.ejs', {    data: rows  });
}

let getExamPage = async (req, res) => {
    const idClass = req.params.idClass
    const data = [[]];
    const [rows, fields] = await pool.execute('select * from exam where idClass = ?', [idClass]);
    const [rows2, fields2] = await pool.execute('select * from classes where idClass = ?', [idClass]);
    let len = rows.length;
    for (let i = 0; i< len; i++) {
        data[i] = Object.values(rows[i]);
    }
    return res.render('user/lecturers/exam.ejs', {    dataExam: data, lgth: len, detail: rows2[0], idUser: rows2[0].idLecturer  })
}

let getDetailExam = async (req, res) => {
    const idExam = req.params.idExam;
    const idClass = req.params.idClass;

    let [rows, fields] = await pool.execute('select * from exam where idTest = ?', [idExam]);
    const detail = rows[0].detail;
    const languageAllow = rows[0].languageAllow

    const [rows3, fields3] = await pool.execute('select * from classes where idClass = ?', [idClass])

    let [rows2, fields2] = await pool.execute('select * from test_case where idTest = ?', [idExam]);

    return res.render('user/lecturers/detailExam.ejs', {   dataDetailExam: detail, dataTestCase: rows2, languageAllow: languageAllow, detail:rows3[0], idUser: rows3[0].idLecturer    });
}

let getDetailUser = async (req, res) => {
    const idUser = req.params.idUser;
    const idClass = req.params.idClass
    let [rows, fields] = await pool.execute('select * from user where idUser = ?', [idUser]);
    const [row2, fields2] = await pool.execute('select * from classes where idClass = ?', [idClass]);
    const data = rows[0];

    return res.render('user/lecturers/detailUser.ejs', {   dataUser: data, detail: row2[0], idUser: row2[0].idLecturer })
}

let uploadUser = async (req, res) => {
    let idUser = req.params.idUser;
    let {   fullname, account, password } = req.body;

    await pool.execute('update user set fullname = ?, account = ?, password = ? where idUser = ?',
        [fullname, account, password, idUser]);
    return res.status(200).json("Updated!");
}

let deleteUser = async (req, res) => {
    try {
        const idUser = req.params.idUser;
        await pool.execute('delete from user where idUser = ?', [idUser])
        return res.status(200).json('Deleted')
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json("Server error!")
    }
}

let deleteExam = async (req, res) => {
    const idClass = req.body.idClass
    let id = req.body.userId;
    await pool.execute('delete from test_case where idTest = ?', [id])
    await pool.execute('delete from exam where idTest = ?', [id])
    var url = '/detail-class/' + idClass + '/exam'

    return res.redirect(url)
}

let getCreateNewExamPage = async (req, res) => {
    const idClass = req.params.idClass;

    const [rows, fields] = await pool.execute('select * from classes where idClass = ?', [idClass])

    return res.render("user/lecturers/createExam.ejs", {   detail: rows[0], idUser: rows[0].idLecturer });
}

let addExam = async (req, res) => {
    const idClass = req.body.idClass
    let nameTest = req.body.nameTest;
    let detail = req.body.detail;
    let languageAllow = '';
    if (req.body.Cpp != undefined) languageAllow += 'Cpp ';
    if (req.body.Java != undefined) languageAllow += 'Java ';
    if (req.body.Python != undefined) languageAllow += 'Python ';
    await pool.execute('insert into exam (nameTest, detail, languageAllow, idClass) values (?, ?, ?, ?)',
        [nameTest, detail, languageAllow, idClass]);

    let [rows, fields] = await pool.execute('select * from exam where nameTest = ?', [req.body.nameTest]);
    let id = rows[0].idTest
    let input = req.body.input;
    let output = req.body.output;
    
    for (let i = 0; i < 10; i++) {
        if (input[i] != "" || output[i] != "") {
            await pool.execute('insert into test_case (input, output, idTest) values (?, ?, ?)',
                [input[i], output[i], id]);
        }
        
    }

    var url = '/detail-class/' + idClass + '/exam'

    return res.redirect(url)
}

let getCreateTest = async (req, res) => {
    const idClass = req.params.idClass;

    const [rows, fields] = await pool.execute('select * from classes where idClass = ?', [idClass])

    return res.render('user/lecturers/createTest.ejs', {    detail: rows[0], idUser: rows[0].idLecturer })
}

let createTest = async (req, res) => {
    const idClass = req.body.idClass
    let nameTest = req.body.nameTest;
    let image = req.body.image;
    let startTime = req.body.startTime;
    let endTime = req.body.endTime;
    let duration = req.body.duration;
    let detail = req.body.detail;
    let languageAllow = '';
    if (req.body.Cpp != undefined) languageAllow += 'Cpp ';
    if (req.body.Java != undefined) languageAllow += 'Java ';
    if (req.body.Python != undefined) languageAllow += 'Python ';
    
    await pool.execute('delete from test')
    await pool.execute('delete from test_case_test')

    await pool.execute('insert into test (testName, testDetail, start_time, end_time, image, duration, languageAllow, idClass) values (?, ?, ?, ?, ?, ?, ?, ?)',
        [nameTest, detail, startTime, endTime, image, duration, languageAllow, idClass]);

    let [rows, fields] = await pool.execute('select * from test where testName = ?', [req.body.nameTest]);
    let id = rows[0].testId
    let input = req.body.input;
    let output = req.body.output;
    
    for (let i = 0; i < 10; i++) {
        if (input[i] != "" || output[i] != "") {
            await pool.execute('insert into test_case_test (testId, input, output) values (?, ?, ?)',
                [id, input[i], output[i]]);
        }
        
    }

    var url = '/detail-class/' + idClass + '/test'

    return res.redirect(url)
}

let getSubmission = async (req, res) => {
    const idClass = req.params.idClass;

    const [rows, fields] = await pool.execute('select * from classes where idClass = ?', [idClass]);
    const [rows2, fields2] = await pool.execute('select s.*, u.fullname from submition as s, user as u where s.idUser = u.idUser and s.idClass = ?', [idClass])

    return res.render('user/lecturers/submission.ejs', {    detail: rows[0], data: rows2, idUser: rows[0].idLecturer    })
}

let grade = async (req, res) => {
    const idClass = req.params.idClass

    const [rows, fields] = await pool.execute('select s.*, t.testId from submition as s, test as t where s.idClass = ? and s.idClass = t.idClass', [idClass]);

    const [rows2, fields2] = await pool.execute('select * from test_case_test where testId = ?', [rows[0].testId])

    var code 
    for (let i = 0; i < rows.length; i++) {
        var count = 0;
        for (let j = 0; j < rows2.length; j++) {
            code = {
                code: rows[i].code,
                input: rows2[j].input,
                lang: rows[i].lang
            }
            var compiler = await fetch("http://localhost:5000/compile", {
                method: "POST",
                headers:{
                  "Content-Type": "application/json"
                },
                body:JSON.stringify(code)
              })
            var output = await compiler.json()
            if (output.output == rows2[j].output) {
                count ++;
            }
        }
        const score = (count/rows2.length)*10
        let roundedScore = score.toFixed(2);

        await pool.execute('update submition set score = ? where idUser = ?', [roundedScore, rows[i].idUser])
    }

    return res.status(200).json('Graded successfully')
}

let savePoint = async (req, res) => {
    const idTest = req.body.idExam
    const idUser = req.body.idUser
    const point = req.body.point
    const runtime = req.body.runtime

    let [rows, fields] = await pool.execute('select * from code where idUser = ? and idTest = ?',
        [idUser, idTest]);
    
    if (rows.length == 0) {
        await pool.execute('insert into code ( idUser, idTest, point, runtime) values (?, ?, ?, ?)',
            [  idUser, idTest, point, runtime ])
    }
    else {
        if (point > rows[0].point) {
            await pool.execute('update code set point = ?, runtime = ? where idUser = ?',
                [  point, runtime, idUser ])
        }
    }
    return res.status(200).json('Submited!')
}

let leaveClass = async (req, res) => {
    try {
        const idUser = req.body.idUser;
        const idClass = req.body.idClass;

        await pool.execute('delete from classMembers where idUser = ? and idClass = ?', [idUser, idClass])

        return res.status(200).json('successfully leave class');
    } catch(error) {
        console.error(error);
        return res.status(404).json('Server error:', error)
    }
}

let getTableScorePage = async (req, res) => {
    let idUser = req.params.idUser

    

    let [rows, fields] = await pool.execute('select * from exam');

    var dataScore = [];

    for (let i = 0; i< rows.length; i++) {
        var ob = {
            "name": "",
            "score": ""
        }
        ob.name = rows[i].nameTest
        let [rows2, fields2] = await pool.execute('select * from code where idUser = ? and idTest = ?',
        [   idUser, rows[i].idTest  ]);
        if (rows2.length == 0) {
            ob.score = "Incomplete"
        }
        else {
            ob.score = rows2[0].point
        }
        dataScore.push(ob);
    }

    return res.render('tableScore.ejs',    {   dataUser: idUser, dataScore: dataScore  })
}

let getTestPage = async (req, res) => {
    const idUser = req.params.idUser
    let [rows ,fields] = await pool.execute('select * from test')
    return res.render('testPage.ejs', { dataId: idUser, dataTest: rows  })
}

let saveCode = async (req, res) => {
    let lang = req.body.lang;
    let code = req.body.code;
    let idUser = req.body.idUser;
    await pool.execute('insert into codeoftest (lang, code, idUser) values (?, ?, ?)',
        [lang, code, idUser]);
    return res.redirect('/user/1')
}

let adminTest = async (req, res) => {
    const idClass = req.params.idClass;

    let [rows, fields] = await pool.execute('select * from test where idClass = ?', [idClass])
    let [rows2, fields2] = await pool.execute('select * from classes where idClass = ?', [idClass])

    var data = {}

    if (rows.length != 0) {
        data = rows[0]
    }

    return res.render('user/lecturers/test.ejs', {    data: rows[0], detail: rows2[0], idUser: rows2[0].idLecturer  })
}

let createClass = async (req, res) => {
    try {
        const className = req.body.className;
        const idUser = req.body.idLecturer;

        const [rows, fields] = await pool.execute('select * from classes where className = ?', [className]);

        if (rows.length == 0) {
            await pool.execute('insert into classes (className, idLecturer) values (?, ?)', [className, idUser]);

            const [rows, fields] = await pool.execute('select * from classes where className = ?', [className]);

            return res.status(201).json({
                idClass: rows[0].idClass
            })
        } else {
            return res.status(400).json('Class name already exists !!!')
        }
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).send('Server error!')
    }
}

let deleteClass = async (req, res) => {
    try {
        const idClass = req.params.idClass;

        await pool.execute('delete from classMembers where idClass = ?', [idClass])
        await pool.execute('delete from classes where idClass = ?', [idClass]);

        return res.status(200).json('Deleted')
    } catch(error) {
        console.error('Error: ', error);
        return res.status(500).send('Server error!')
    }
}

let replaceLecturer = async (req, res) => {
    try {
        const idClass = req.params.idClass;
        const idUser = req.body.idUser;

        const [rows, fields] = await pool.execute('select * from user where idUser = ?', [idUser])

        if (rows[0].role === "lecturer") {

            await pool.execute('update classes set idLecturer = ? where idClass = ?', [idUser, idClass])

            return res.status(200).json('Replace successful')
        } else {
            return res.status(201).json('The user is not a lecturer')
        }
    } catch(error) {
        console.error('Error: ', error);
        return res.status(500).send('Server error!')
    }
}

let detailClass = async (req, res) => {
    try {
        const idClass = req.params.idClass;

        const [rows, fields] = await pool.execute('select u.idUser, u.fullname from user as u, classMembers as cM where u.idUser = cM.idUser and cM.idClass = ?', [idClass]);
        const [rows2, fields2] = await pool.execute('select * from classes where idClass = ?' ,[idClass]);

        return res.status(200).render('user/lecturers/detailClass.ejs', {
            data: rows,
            idClass: idClass,
            detail: rows2[0],
            idUser: rows2[0].idLecturer
        })
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json('Server error!!!')
    }
}

let addStudents = async (req, res) => {
    try {
        const arrStudents = req.body.arrStudents;
        const idClass = req.body.idClass;

        var StudentsErr = "The following student ids were not added successfully: ";
        for (let i = 0; i < arrStudents.length; i++) {
            console.log(arrStudents[i])
            if (arrStudents[i] !== 0) {
                try {
                    const [rows, fields] = await pool.execute('select * from classMembers where idClass = ? and idUser = ?', [idClass, arrStudents[i]])
                    if (rows.length === 0) {
                        await pool.execute('insert into classMembers (idClass, idUser) values (?, ?)', [idClass, arrStudents[i]])
                    }       
                } catch (error) {
                    console.log(error)
                    StudentsErr += arrStudents[i] + " "
                }
            }
        }

        if (StudentsErr === "The following student ids were not added successfully: ") {
            return res.status(200).json('Added students')
        } else {
            return res.status(200).json(StudentsErr)
        }
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).send("Server error!!!")
    }
}

let removeStudent = async (req, res) => {
    try {
        const idUser = req.body.idUser
        const idClass = req.body.idClass

        await pool.execute('delete from classMembers where idClass = ? and idUser = ?', [idClass, idUser])

        return res.status(200).json('Student has been removed from the class')
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json("Server error!!!")
    }
}

let profileUser = async (req, res) => {
    function hideString(str) {
        return '*'.repeat(str.length);
    }
    const idUser = req.params.idUser;  
    const role = req.params.role;
    var file;

    if (role == 'student') {
        file = 'user/students/profile.ejs'
    } else {
        file = 'user/lecturers/profile.ejs'
    }

    const [rows, fields] = await pool.execute('select * from user where idUser = ?', [idUser])
    rows[0].password = hideString(rows[0].password);

    return res.render(file , {    idUser: idUser, data: rows[0]  })
    
}

let changePassword = async (req, res) => {
    const idUser = req.body.idUser;
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword

    const [rows, fields] = await pool.execute('select * from user where idUser = ?', [idUser]);

    if (rows[0].password === currentPassword) {
        await pool.execute('update user set password = ?', [newPassword])
        return res.status(200).json('Password successfully changed!')
    } else {
        return res.status(201).json('Incorrect password. Please make sure you have entered the correct password')
    }
}

let LecturersPage = async (req, res) => {
    try {
        const [rows, fields] = await pool.execute('select * from user where role = ?', ["lecturer"])
        return res.status(200).render("admin/lecturers.ejs", { data: rows  })
    } catch (error) {
        console.error(error)
        return res.status(500).json('Server error !')
    }
}

let StudentsPage = async (req, res) => {
    try {
        const [rows, fields] = await pool.execute('select * from user where role = ?', ["student"])
        return res.status(200).render("admin/students.ejs", {   data: rows  })
    } catch (error) {
        console.error(error)
        return res.status(500).json('Server error !')
    }
}

let newLecturerPage = async (req, res) => {
    try {
        return res.render("admin/newLecturer.ejs")
    } catch (error) {
        console.error("Error: ", error);
        return res.status(500).json("Server error")
    }
}

let newLecturer = async (req, res) => {
    try {
        let {   fullname, account, password } = req.body;

        let [rows, fields] = await pool.execute('select  * from user where account = ?', [account]);
    
    
        if (rows.length == 0) {
            await pool.execute('insert into user (account, password, fullname, role) values (?, ?, ?, "lecturer")',
                [account, password, fullname]);
    
            return res.status(200).json('Account successfully created')
    
        }
        else {
            return res.status(201).json('Account already exists')
        }
    } catch (error) {
        console.error("Error: ", error);
        return res.status(500).json("Server error")
    }
}

let detailUser = async (req, res) => {
    try {
        const idUser = req.params.idUser;
        const role = req.params.role;

        const [rows, fields] = await pool.execute('select * from user where idUser = ?', [idUser]);

        if (rows[0].role !== role) {
            return res.send('User #' + idUser + ' is not a ' + role)
        } else {
            return res.render("admin/detailUser.ejs", {     data: rows[0]   })
        }
    } catch (error) {
        console.error(error);
        return res.send('Server error!')
    }
}

module.exports = {
    getHomepage, getLoginPage, getSignupPage, createNewUser,
    login, getUserPage, getExamPage, profileUser,
    getDetailExam, getDetailUser, uploadUser, deleteUser,
    deleteExam, getCreateNewExamPage, addExam, savePoint,
    getTableScorePage, adminClasses, getTestPage, saveCode,
    adminTest, checkRole, createClass, deleteClass,
    detailClass, addStudents, removeStudent, getCreateTest,
    createTest, getSubmission, joinClass, detailClassStudent,
    membersClassStudent, examStudent, leaveClass, checkTest,
    testStudent, getDataTest, submit, grade,
    changePassword, replaceLecturer, LecturersPage, StudentsPage,
    newLecturerPage, newLecturer, detailUser
}