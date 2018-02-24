var express = require('express');
var bodyParser = require('body-parser');
//use require keyword to refer and use handlebars module
const handlebars = require('express-handlebars');
var config = require('./config/database');
const mongoose = require('mongoose');
var session = require('express-session');
const expressValidator = require('express-validator');
var fileUpload = require('express-fileupload');
//middleware module called Connect Mongo to add a Mongo session store
//calling it passing our express session as an argument.
//This lets the connect Mongo middleware access the sessions.
var MongoStore = require('connect-mongo')(session);
var path = require('path');
var helpers = require('handlebars-helpers')();


//express application (app) is created using the express() function
const app = express();

//connection string that specifies the database
mongoose.connect(config.database);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connected to Mongo DB');
});


//use sessions for tracking logins
app.use(session({
    //only required object is secret
    //string used to sign session id cookie
    secret: 'Chris Shaw CS602',
    //forces session to be saved in the sessions store
    //whether anything changes in req or not
    resave: true,
    //forces an unitialized session to be 
    //saved in session store
    //we dont want to save, so set to false
    saveUninitialized: false
}));




// make user ID available in templates
app.use((req, res, next) => {
    //locals provides a way to add info to the response object
    //all views have access - userId stored in currentUser property
    //if not logged in - value of currentUser is undefined
    res.locals.currentUser = req.session.userId;
    res.locals.admin = req.session.admin;
    res.locals.total = req.session.total;
    next();
});

//create session cart array - with product objects
//make available everywhere
// * for each get request
app.get('*', function (req, res, next) {
    //cart will be available in each get request
    res.locals.cart = req.session.cart;
    next();
});

// Express fileUpload middleware
//get file from form input
app.use(fileUpload());

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));


/*
    * Reference for ifCond helper setup
    * author: Adam Beres-Deak
    * 2014
*/
// setup handlebars view engine
// setup handlebars helpers

app.engine('handlebars',
    handlebars({
        helpers: {
            ifCond: function (v1, operator, v2, options) {

                switch (operator) {
                    case '==':
                        return (v1 == v2) ? options.fn(this) : options.inverse(this);
                    case '===':
                        return (v1 === v2) ? options.fn(this) : options.inverse(this);
                    case '!=':
                        return (v1 != v2) ? options.fn(this) : options.inverse(this);
                    case '!==':
                        return (v1 !== v2) ? options.fn(this) : options.inverse(this);
                    case '<':
                        return (v1 < v2) ? options.fn(this) : options.inverse(this);
                    case '<=':
                        return (v1 <= v2) ? options.fn(this) : options.inverse(this);
                    case '>':
                        return (v1 > v2) ? options.fn(this) : options.inverse(this);
                    case '>=':
                        return (v1 >= v2) ? options.fn(this) : options.inverse(this);
                    case '&&':
                        return (v1 && v2) ? options.fn(this) : options.inverse(this);
                    case '||':
                        return (v1 || v2) ? options.fn(this) : options.inverse(this);
                    default:
                        return options.inverse(this);
                }

            },
            sub: function (v1, v2) {
                return v1 * v2;
            },
            toFixed: function (number) {
                return parseFloat(number).toFixed(2);
            },
            var: function (name, value){
                this[name] += value;
            }

        },
        defaultLayout: 'main',
        partialsDir: [
            //  path to your partials
            __dirname + '/views/partials',
        ]
    }));
app.set('view engine', 'handlebars');



// set global errors variable
app.locals.errors = null;

//get category model
var Category = require('./models/category');

// Get all categories to pass to header
Category.find(function (err, categories) {

    if (err) {
        console.log(err);
    } else {
        //set global categories
        app.locals.categories = categories;
    }

});


/*
    * Reference for validator
    * author: Vojislav Kovacevic
    * 2017
*/
// Express Validator middleware


//express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    // if there's a flash message in the session request, make it available 
    // in the response, then delete it
    res.locals.sessionFlash = req.session.sessionFlash;
    delete req.session.sessionFlash;
    next();
});

// Express Validator middleware
app.use(expressValidator({
    
    //custom validate that is an image added
    customValidators: {
        isImage: function (value, filename) {
            var extension = (path.extname(filename)).toLowerCase();
            switch (extension) {
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case '.png':
                    return '.png';
                case '':
                    return '.jpg';
                default:
                    return false;
            }
        }
    }
}));

// include routes
var routes = require('./routes/index');
var adminCategories = require('./routes/admin_categories.js');
var adminProducts = require('./routes/admin_products.js');
var products = require('./routes/products.js');
var cart = require('./routes/cart.js');
var purchaseHistory = require('./routes/admin_purchaseHistory.js');
var cusPurchaseHistory = require('./routes/purchaseHistory.js');

//use
app.use('/', routes);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);
app.use('/products', products);
app.use('/cart', cart);
app.use('/admin/history', purchaseHistory);
app.use('/history', cusPurchaseHistory);




// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('File Not Found');
    err.status = 404;
    next(err);
});

// error handler
// define as the last app.use callback
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.PORT || 3000);

// listen on port 3000
app.listen(app.get('port'), function () {
    console.log('Express app listening on port 3000');
});

