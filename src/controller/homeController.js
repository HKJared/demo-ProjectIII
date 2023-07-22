const pool = require('../config/connectDB');

let getHomepage = async (req, res) => {

    return res.render('index.ejs');
    
}

let getLoginPage = async (req, res) => {
    
    return res.render('login.ejs');
    
}

let getSignupPage = async (req, res) => {


    res.render('signup.ejs');
    
}

let checkLogin = async (req, res) => {
    let {   account, password } = req.body;

    if (!account || !password) {
        return res.redirect('/login')
    }
    else {
        let [rows, fields] = await pool.execute('select  * from user where account = ? and password = ?', [account, password]);

        if (rows.length == 0) {
            return res.redirect('/login');
        }
        else {
            let id = rows[0].idUser;
            if (id == 0) {
                return res.redirect('/admin');
            }
            else {
                return res.redirect('/user/' + id);
            }
        }
    }

}

let createNewUser = async (req, res) => {

    console.log('>> check request: ', req.body);

    let {   fullname, account, password } = req.body;
    let [rows, fields] = await pool.execute('select  * from user where account = ?', [account]);


    if (rows.length == 0) {
        await pool.execute('insert into user (account, password, fullname) values (?, ?, ?)',
            [account, password, fullname]);

        return res.redirect('/login')
    }
    else {
        return res.redirect('/signup')
    }
}

let getUserPage = async (req, res) => {
    let id = req.params.idUser;

    const [rows, fields] = await pool.execute('select * from test'); //create deatailExam array
    const idExam = [], detail = []
    for (let i = 0; i<rows.length; i++) {
        idExam[i] = rows[i].idTest;
        detail[i] = rows[i].detail;
    }
    var examId = JSON.parse(JSON.stringify(Object.assign({}, idExam)));  
    var detailExam = JSON.parse(JSON.stringify(Object.assign({}, detail)));

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
        testId: testId,
        testInput: testInput,
        testOutput: testOutput
    })
}

let getAdminPage = async (req, res) => {
    const data = [[]];
    const [rows, fields] = await pool.execute('select * from user');
    let len = rows.length - 1;
    for (let i = 0; i< len; i++) {
        data[i] = Object.values(rows[i+1]);
    }

    return res.render('admin.ejs', {    dataUser: data, lgth: len  });
}

let getExamPage = async (req, res) => {
    const data = [[]];
    const [rows, fields] = await pool.execute('select * from test');
    let len = rows.length;
    for (let i = 0; i< len; i++) {
        data[i] = Object.values(rows[i]);
    }
    return res.render('exam.ejs', {    dataExam: data, lgth: len  })
}

let getDetailExam = async (req, res) => {
    let id = req.params.idExam;
    let [rows, fields] = await pool.execute('select * from test where idTest = ?', [id]);
    const detail = rows[0].detail;

    let [rows2, fields2] = await pool.execute('select * from test_case where idTest = ?', [id]);

    return res.render('detailExam.ejs', {   dataDetailExam: detail, dataTestCase: rows2    });
}

let getDetailUser = async (req, res) => {
    let id = req.params.idUser;
    let [rows, fields] = await pool.execute('select * from user where idUser = ?', [id]);
    const data = rows[0];

    return res.render('detailUser.ejs', {   dataUser: data  })
}

let uploadUser = async (req, res) => {
    let id = req.params.idUser;
    let {   fullname, account, password, point } = req.body;

    await pool.execute('update user set fullname = ?, account = ?, password = ?, point = ? where idUser = ?',
        [fullname, account, password, point, id]);
    return res.redirect('/admin');
}

let deleteUser = async (req, res) => {
    let id = req.body.userId;
    await pool.execute('delete from user where idUser = ?', [id])
    return res.redirect('/admin')
}

let deleteExam = async (req, res) => {
    let id = req.body.userId;
    await pool.execute('delete from test where idTest = ?', [id])
    await pool.execute('delete from test_case where idTest = ?', [id])
    return res.redirect('/exam')
}

let getCreateNewExamPage = async (req, res) => {
    return res.render("createExam.ejs");
}

let addExam = async (req, res) => {
    let nameTest = req.body.nameTest;
    let detail = req.body.detail;
    await pool.execute('insert into test (nameTest, detail) values (?, ?)',
        [nameTest, detail]);

    let [rows, fields] = await pool.execute('select * from test where nameTest = ?', [req.body.nameTest]);
    let id = rows[0].idTest
    let input = req.body.input;
    let output = req.body.output;
    
    for (let i = 0; i < 10; i++) {
        if (input[i] != "" || output[i] != "") {
            await pool.execute('insert into test_case (input, output, idTest) values (?, ?, ?)',
                [input[i], output[i], id]);
        }
        
    }

    return res.redirect('/exam')
}

let savePoint = async (req, res) => {
    const idTest = req.body.idExam
    const idUser = req.body.idUser
    const point = req.body.point

    let [rows, fields] = await pool.execute('select * from code where idUser = ? and idTest = ?',
        [idUser, idTest]);
    
    if (rows.length == 0) {
        await pool.execute('insert into code ( idUser, idTest, point) values (?, ?, ?)',
            [  idUser, idTest, point ])
    }
    else {
        if (point > rows[0].point) {
            await pool.execute('update code set point = ? where idUser = ?',
                [  point, idUser ])
        }
    }
    return res.redirect('/user/' + idUser)
}

let getTableScorePage = async (req, res) => {
    let idUser = req.params.idUser

    

    let [rows, fields] = await pool.execute('select * from test');

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

let getSearchPage = async (req, res) => {
    let name = req.body.nameUser
    var data = [];
    let [rows, fields] = await pool.execute('select * from user');
    for (let i = 0; i< rows.length; i++) {
        if (rows[i].fullname.includes(name)) {
            data.push(rows[i])
        }
    }

    var check

    if (data.length == 0) check = 0;
    else check = 1;

    return res.render('searchUser.ejs', {   dataUser: data, dataSearch: name, dataCheck: check    })
}

module.exports = {
    getHomepage, getLoginPage, getSignupPage, createNewUser,
    checkLogin, getUserPage, getAdminPage, getExamPage,
    getDetailExam, getDetailUser, uploadUser, deleteUser,
    deleteExam, getCreateNewExamPage, addExam, savePoint,
    getTableScorePage, getSearchPage
}