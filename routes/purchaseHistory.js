var express = require('express');

var router = express.Router();

//get Product model
var PurchaseHistory = require('../models/purchase_history');

//retrieve Product model
const Product = require('../models/product');

//retrieve Product model
const User = require('../models/user');



/*
 * GET purchase history for current user
 */
router.get('/:id', function (req, res) {

    var id = req.params.id;
    console.log('what');

    PurchaseHistory.find({id: id},function (err, history) {
        if (err)
            return console.log(err);


    
        res.render('history', {
            purchase: history
        });

    });
});


//exports
module.exports = router;