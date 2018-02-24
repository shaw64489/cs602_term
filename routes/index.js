/*
    * Reference for bcrypt login encryption
    * author: Daniel Deutsch
    * author: Cory LaViska
    * 2017
*/

const express = require('express');

const router = express.Router();
//use require keyword to refer and use bcrypt module
//const bcrypt = require('bcrypt');
//use require keyword to refer and use bcrypt module
const bcrypt = require('bcryptjs');


//import and use middleware module
const mid = require('../middleware');

/******************************
********  Retrieve Models  ****
******************************/

//retrieve User model
const User = require('../models/user')

//get Product model
const Product = require('../models/product');

// GET profile
//add middleware for users not logged in
router.get('/profile', mid.requiresLogin, (req, res, next) => {

  //retrieve userID from session store
  let id = req.session.userId;
  //exec query against mongo db - retrieving user info from mongo
  User.findById(id)
    .exec( (error, user) => {
      if (error) {
        return next(error);
        //if no error - render profile template  
      } else {

        return res.render('profile', { title: 'Profile', name: user.name, id: user.id});
      }
    });
});

// GET admin
//add middleware for users not admin
router.get('/admin', mid.requiresLogin, (req, res, next) => {

  //retrieve userID from session store
  //exec query against mongo db - retrieving user info from mongo
  User.findById(req.session.userId)
    .exec( (error, user) => {

      //if error or user not admin alert user
      if (error || user.admin != 1) {
        let err = new Error('You must be Admin to view this page.');
        err.status = 401;
        return next(err);

        //if no error and user is admin - render admin template  
      } else {
        return res.render('admin', { title: 'Admin', name: user.name});
      }
    });


});

// GET logout
//on logout destroy current session
router.get('/logout', (req, res, next) => {

  //check to see if session exists
  //if it does, delete it
  if (req.session) {

    //delete session object
    req.session.destroy( (err) => {
      if (err) {
        return next(err);

      } else {

        //redirect home
        return res.redirect('/');
      }
    });
  };
});

// GET login
//add middleware for users logged in already
router.get('/login', mid.loggedOut, (req, res, next) => {
  return res.render('login', { title: '' });
});




// POST login
router.post('/login', (req, res, next) => {
  if (req.body.email && req.body.password) {
    //authenticate login on imported User model
    //pass email and password from form and callback


    //query to find user with matching email address
    User.findOne({ email: req.body.email })
      //use exec to perform search and provide callback to process
      .exec( (error, user) => {

        if (error) {
          let error = new Error('Wrong email or password');
          error.status = 401;
          return next(error);

          //return error if email address wasnt in any document
        } else if (!user) {
          let error = new Error('No user');
          error.status = 401;
          return next(error);
        }

        //use bcrypt compar to compared supplied password with hash version
        //return error or result if match
        bcrypt.compare(req.body.password, user.password, (error, result) => {
          //if pw matches return null and user document
          if (result === true) {

            //create session - save user id into session
            //stored on server - cookie is sent containing session id
            //session data on req object
            //add property to session and assign value user unique ID
            req.session.userId = user._id;

            console.log('Login successful')
            //logged in and redirect to profile
            return res.redirect('profile');

          } else {

            let err = new Error('Email and Password are required');
            //missing or bad authentication
            err.status = 401;
            return next(err);
          }
        });
      });

  } else {

    let err = new Error('Email and Password are required or incorrect');
    //missing or bad authentication
    err.status = 401;
    return next(err);
  }

});

// GET register
//add middleware for users logged in already
//although this will be skipped because handlebars view checks
router.get('/register', mid.loggedOut, (req, res, next) => {
  return res.render('register');
});

// POST register
router.post('/register', (req, res, next) => {

  //if all fields have been entered in form
  if (req.body.email &&
    req.body.name &&
    req.body.password &&
    req.body.confirmPassword) {

    //confirm that user typed same password twice
    if (req.body.password !== req.body.confirmPassword) {
      let err = new Error('Passwords need to match');
      //bad request - missing info
      err.status = 400;
      //return error to error handling middleware
      return next(err);
    }

    //create object with form input
    //set as admin by default
    //to change to normal user - set to 0
    let userData = {
      email: req.body.email,
      name: req.body.name,
      password: req.body.password,
      admin: 1
    };

    // insert into  using schema create method
    User.create(userData, (error, user) => {

      if (error) {
        return next(error);

      } else {
        //create session - save user id into session
        //stored on server - cookie is sent containing session id
        //session data on req object
        //add property to session and assign value user unique ID
        req.session.userId = user._id;

        return res.redirect('/profile');
      }
    });


  } else {
    var err = new Error('All fields required');
    //bad request - missing info
    err.status = 400;
    //return error to error handling middleware
    return next(err);
  }
});

// GET home
router.get('/', (req, res, next) => {
  return res.render('home', { title: '' });
});

// GET about
router.get('/about', (req, res, next) => {
  return res.render('about', { title: 'About' });
});

// GET categories
router.get('/categories', (req, res, next) => {
  return res.render('categories', { title: 'Categories' });
});

// POST search
router.post('/categories/search/', (req, res, next) => {

  //retrieve product title from request body and convert to lower case
  let product = req.body.product;
  product = product.replace(/\s+/g, '-').toLowerCase();


  //find the product that match - reg expression used to find partial match
  Product.findOne({slug: {'$regex' : product, '$options' : 'i'} }, (err, product) => {

    if (err)
      console.log(err);
    
    //if a match store product category and slug
    if (product) {

      let cat = product.category;
      let slug = product.slug;

      //redirect to that product details page
      res.redirect('/products/' + cat + '/' + slug);

    } else {

      //if no match - alert with flash message
      req.session.sessionFlash = {
        type: 'error',
        message: 'Product not in inventory!'
    }
    res.redirect('/categories/');

    }
  });
});

//export module
module.exports = router;
