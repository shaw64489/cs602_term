var express = require('express');

var router = express.Router();

//get Product model
var PurchaseHistory = require('../models/purchase_history');

//retrieve Product model
const Product = require('../models/product');

//retrieve Product model
const User = require('../models/user');


/*
 * GET purchase history index
 */
router.get('/', function (req, res) {

    console.log('what');

    PurchaseHistory.find(function (err, history) {
        if (err)
            return console.log(err);



        res.render('admin/history', {
            purchase: history
        });

    });
});

/*
 * GET purchase history for customer
 */
router.get('/:id', function (req, res) {

    var id = req.params.id;
    console.log('what');

    PurchaseHistory.find({id: id},function (err, history) {
        if (err)
            return console.log(err);


    
        res.render('admin/history', {
            purchase: history
        });

    });
});


//exports
module.exports = router;