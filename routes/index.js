/*
    * Reference for bcrypt login encryption
    * author: Andrew Chalkley
    * 2017
*/

var express = require('express');
var router = express.Router();
//use require keyword to refer and use bcrypt module
const bcrypt = require('bcrypt');


//import and use middleware module
const mid = require('../middleware');

//retrieve User model
var User = require('../models/user')

//get Product model
var Product = require('../models/product');

// GET /profile
//add middleware for users not logged in
router.get('/profile', mid.requiresLogin, function (req, res, next) {

  //retrieve userID from session store
  //exec query against mongo db - retrieving user info from mongo
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
        //if no error - render profile template  
      } else {
        return res.render('profile', { title: 'Profile', name: user.name, id: user.id});
      }
    })

});

// GET /admin
//add middleware for users not admin
router.get('/admin', mid.requiresLogin, function (req, res, next) {

  //retrieve userID from session store
  //exec query against mongo db - retrieving user info from mongo
  User.findById(req.session.userId)
    .exec(function (error, user) {

      if (error || user.admin != 1) {
        var err = new Error('You must be Admin to view this page.');
        err.status = 401;
        return next(err);
        //if no error - render admin template  
      } else {
        return res.render('admin', { title: 'Admin', name: user.name});
      }
    });


});

// GET /logout
router.get('/logout', function (req, res, next) {
  //check to see if session exists
  //if it does, delete it
  if (req.session) {
    //delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  };
});

// GET /login
//add middleware for users logged in already
router.get('/login', mid.loggedOut, function (req, res, next) {
  return res.render('login', { title: '' });
});






// POST /login
router.post('/login', function (req, res, next) {
  if (req.body.email && req.body.password) {
    //authenticate login on imported User model
    //pass email and password from form and callback


    //query to find user with matching emaill address
    User.findOne({ email: req.body.email })
      //use exec to perform search and provide callback to process
      .exec(function (error, user) {
        if (error) {
          var error = new Error('Wrong email or password');
          error.status = 401;
          return next(error);
          //return error if email address wasnt in any document
        } else if (!user) {
          var error = new Error('No user');
          error.status = 401;
          return next(error);
        }
        //use bcrypt compar to compared supplied password with hash version
        //return error or result if match
        bcrypt.compare(req.body.password, user.password, function (error, result) {
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

            var err = new Error('Email and Password are required');
            //missing or bad authentication
            err.status = 401;
            return next(err);
          }
        });
      });

  } else {
    var err = new Error('Email and Password are required');
    //missing or bad authentication
    err.status = 401;
    return next(err);
  }

});

// GET /register
//add middleware for users logged in already
router.get('/register', mid.loggedOut, function (req, res, next) {
  return res.render('register');
});

// POST /register
router.post('/register', function (req, res, next) {
  if (req.body.email &&
    req.body.name &&
    req.body.password &&
    req.body.confirmPassword) {

    //confirm that user typed same password twice
    if (req.body.password !== req.body.confirmPassword) {
      var err = new Error('Passwords need to match');
      //bad request - missing info
      err.status = 400;
      //return error to error handling middleware
      return next(err);
    }

    //create object with form input
    var userData = {
      email: req.body.email,
      name: req.body.name,
      password: req.body.password,
      admin: 0
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

// GET /
router.get('/', function (req, res, next) {
  return res.render('home', { title: '' });
});

// GET /about
router.get('/about', function (req, res, next) {
  return res.render('about', { title: 'About' });
});

// GET /contact
router.get('/contact', function (req, res, next) {
  return res.render('contact', { title: 'Contact' });
});

// GET /categories
router.get('/categories', function (req, res, next) {
  return res.render('categories', { title: 'Categories' });
});

// POST /search
router.post('/categories/search/', function (req, res, next) {

  var product = req.body.product;
  product = product.toLowerCase();


  Product.findOne({slug: {'$regex' : product, '$options' : 'i'} }, function (err, p) {
    if (err)
      console.log(err);
    if (p) {

      var cat = p.category;
      var slug = p.slug;

      res.redirect('/products/' + cat + '/' + slug);
    } else {

      req.session.sessionFlash = {
        type: 'error',
        message: 'Product not in inventory!'
    }
    res.redirect('/categories/');

    }
  });
});

  module.exports = router;
