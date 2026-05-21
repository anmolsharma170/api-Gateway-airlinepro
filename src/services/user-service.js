const {UserRepository} = require('../repositories');
const {StatusCodes} = require('http-status-codes')
const AppError = require('../utils/errors/app-error');
const userRepo = new UserRepository();
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

module.exports={
    create
}