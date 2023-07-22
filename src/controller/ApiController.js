const pool = require('../config/connectDB');

let getAllUser = async (req, res) => {
    const [rows, fields] = await pool.execute('select * from user');

    return res.status(200).json({
        message: 'Jared',
        data: rows
    })
}

let createNewUser = async (req, res) => {
    let {   account, password, fullname } = req.body; 

    if (!account || !password || !fullname) {
        return res.status(200).json({
            message: 'missing required params'
        })
    }

    await pool.execute('insert into user (account, password, fullname) values (?, ?, ?)',
        [account, password, fullname])

    return res.status(200).json({
        message: 'ok'
    })
}

let updateUser = async (req, res) => {
    let {   account, password, fullname, id } = req.body;

    if (!account || !password || !fullname) {
        return res.status(200).json({
            message: 'missing required params'
        })
    }

    await pool.execute('update user set account = ?, password = ?, fullname = ? where idUser = ?', 
        [account, password, fullname, id]);
    return res.status(200).json({
        message: 'ok'
    })
}

let deleteUser = async (req, res) => {
    let userId = req.params.id;

    if (!userId) {
        return res.status(200).json({
            message: 'missing required params'
        })
    }

    await pool.execute('delete from user where idUser = ?', [userId]);
    return res.status(200).json({
        message: 'ok'
    })
}

module.exports = {
    getAllUser, createNewUser, updateUser, deleteUser
}