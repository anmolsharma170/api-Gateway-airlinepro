const {UserRepository} = require('../repositories');
const {StatusCodes} = require('http-status-codes')
const AppError = require('../utils/errors/app-error');
const userRepo = new UserRepository();
const {Auth} = require('../utils/common');
async function create(data){
    try{
        const user = await userRepo.create(data);
        return user;
    } catch(error){
        // instead of loging errors everytime we will be using stacktrace 
        if(error.name=='SequelizeValidationError' || error.name=='SequelizeUniqueConstraintError'){
            // console.log(error);
            let explanantion = [];
            error.errors.forEach((err)=>{
                explanantion.push(err.message);
            });
            // console.log(explanantion);
            throw new AppError(explanantion,StatusCodes.BAD_REQUEST);
        }
        throw new AppError('Cannot create a new user object',StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function signin(data){
    try {
        const user = await userRepo.getUserByEmail(data.email);
        if(!user){
            throw new AppError('No user found for given email',StatusCodes.NOT_FOUND);
        }
        const passwordMatch = Auth.checkPassword(data.password,user.password);
        if(!passwordMatch) {
            throw new AppError('Invalid password',StatusCodes.BAD_REQUEST);
        }
        const jwt = Auth.createToken({id: user.id, email:user.email});
        return jwt;
    } catch (error) {
        console.log(error);
        if(error instanceof AppError) throw error;
        throw new AppError('Something went wrong', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function isAuthenticated(token){
    try {
        if(!token){
            throw new AppError('Missing JWT token',StatusCodes.BAD_REQUEST);
        }
        const response = Auth.verifyToken(token);
        const user = await userRepo.get(response.id);
        if(!user){
            throw new AppError('No user found',StatusCodes.NOT_FOUND);
        }
        return user.id;
    } catch (error) {
        if(error instanceof AppError) throw error;
        if(error.name=='JsonWebTokenError'){
            throw new AppError('Invalid JWT token',StatusCodes.BAD_REQUEST);
        }
        console.log(error);
        throw error;
    }
}

module.exports={
    create,
    signin,
    isAuthenticated
}