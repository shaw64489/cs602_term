/*
    * Reference for bcrypt login encryption and hash
    * author: Andrew Chalkley
    * 2017
*/

//use require keyword to refer and use mongoose module
const mongoose = require('mongoose');
//use require keyword to refer and use bcrypt module
const bcrypt = require('bcrypt');

/*use require keyword to refer and use credentials module
const credentials = require("../credentials.js");


//connection string that specifies the database
const dbUrl = 'mongodb://' + credentials.username +
  ':' + credentials.password + '@' + credentials.host + ':' + credentials.port + '/' + credentials.database;

//connection required for accessing the MongoDB database
let connection = null;
*/
let model = null;


//Mongoose Schema class 
const Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

var UserSchema = new mongoose.Schema({
  email: {
    //type of data
    type: String,
    //mongodb enforces email field
    required: true,
    //remove white space before or after text
    trim: true,
    //does not already exist
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true
  },
  admin: {
    type: Number,
    required: true
  }
});




//authenticate input against db documents
UserSchema.statics.authenticate = (email, password, callback) => {

  //query to find user with matching emaill address
  model.findOne({ email: email })
    //use exec to perform search and provide callback to process
    .exec(function (error, user) {
      if (error) {
        return callback(error);
        //return error if email address wasnt in any document
      } else if (!user) {
        var err = new Error('User not found!');
        err.status = 401;
        return callback(err);
      }
      //use bcrypt compar to compared supplied password with hash version
      //return error or result if match
      bcrypt.compare(password, user.password, function (error, result) {
        //if pw matches return null and user document
        if (result === true) {

          return callback(null, user);

        } else {
          
          return callback();
        }
      });
    });
}


//hash pw before saving to db
UserSchema.pre('save', function (next) {
  //this - refers to the object we create containing info user entered in sign up
  var user = this;
  //use bcrpyt for both has and salt
  //password, 10 apply encrpt algorithm - callback after password is hashed - err if hash fails
  //use callback to replace plain text with hash pw
  bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) {
      return next(err);
    }
    //if no error - assign hash
    user.password = hash;
    //call next function in middleware stack
    next();
  });
});



/*model function is used for defining the model associated with the schema
//model provides the constructor for creating instances of the document
//export model via getModel
module.exports.getModel =
  () => {
    if (connection == null) {
      console.log("Creating connection and model...");
      //creates the MongoDB connection object
      connection = mongoose.createConnection(dbUrl);
      //creates the model object, loading schema
      model = connection.model("user2",
        UserSchema);
    };
    return model;
  }; */

  var User = module.exports = mongoose.model('user2', UserSchema);