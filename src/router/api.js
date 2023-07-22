const express = require('express');

const ApiController = require('../controller/ApiController');

let router = express.Router();

const initApiRoute = (app) => {
    router.get('/users', ApiController.getAllUser); // METHOD GET -> read data
    router.post('/create-user', ApiController.createNewUser); // METHOD POST -> create data
    router.put('/update-user', ApiController.updateUser);  // METHOD PUT -> update data
    router.delete('delete-user/:id', ApiController.deleteUser);  // METHOD DELETE -> delete data

    return app.use('/api/v1/', router)
}


module.exports = initApiRoute;