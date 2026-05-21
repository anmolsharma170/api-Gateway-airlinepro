const {StatusCodes} = require('http-status-codes');
const {UserService} = require('../services');
const { error } = require('winston');
const {SuccessResponse, ErrorResponse} = require('../utils/common');

/*
POST : /signup here url will have /sign up because it makes more sense here
req-body {email:'a#b.com', password: 1234}
*/
async function signup(req,res){
    try{
        const user = await UserService.create({
            email: req.body.email,
            password: req.body.password
        });
        SuccessResponse.data = user;
        return res
                .status(StatusCodes.CREATED)
                .json(SuccessResponse);
    }
    catch(error){
        ErrorResponse.error = error;
        return res
        .status(error.statusCode)
        .json(ErrorResponse);
    }
}
module.exports={
    signup
}