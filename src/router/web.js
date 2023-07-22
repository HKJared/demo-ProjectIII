const express = require('express');
const app = express();

const homeController = require('../controller/homeController');


let router = express.Router();

let initWebRoute = (app) => {
    router.get("/", homeController.getHomepage);

    router.get("/login-user", homeController.getLoginPage)
 
}


module.exports = initWebRoute;