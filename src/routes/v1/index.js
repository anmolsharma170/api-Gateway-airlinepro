const express = require('express');
const {InfoController} = require('../../controllers')
const router = express.Router(); //router object is used to define the routes for our application. it is a middleware that is used to handle the requests and responses for our application. it is used to define the routes for our application and then we can use it in our main file app.js to use the routes defined in this file.
const userRoutes = require('./user-routes');
const {AuthRequestMiddlewares} = require('../../middlewares')
router.get('/info',AuthRequestMiddlewares.checkAuth,InfoController.info);
router.use('/user', userRoutes);

module.exports = router;
