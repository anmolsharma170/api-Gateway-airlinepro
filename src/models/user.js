'use strict';
const {
  Model
} = require('sequelize');
const {ServerConfig} = require('../config');
const serverConfig = require('../config/server-config');
const bcrypt = require('bcrypt');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsToMany(models.Role,{through:'User_Roles', as: 'role'})
    }
  }
  User.init({
    email: {
      type:DataTypes.STRING,
      allowNull:false,
      unique: true,
      validate:{
        isEmail:true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull:false,
        validate:{
          len:[5,50]
        }
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  User.beforeCreate(function encrypt(user){  //here we are encrypting the password before creating the user in the database. we are using bcrypt library to encrypt the password. we are using serverConfig.SALT_ROUNDS to encrypt the password. we are using beforeCreate hook to encrypt the password before creating the user in the database.
    const encryptedPassword = bcrypt.hashSync(user.password,+serverConfig.SALT_ROUNDS); //it takes serverConfig.SALT_ROUNDS as string therefore we added + to make it to number
    user.password=encryptedPassword;
  });
  return User;
}; 