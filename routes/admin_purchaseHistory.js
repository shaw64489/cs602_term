const express = require('express');

const router = express.Router();

/******************************
******** Retrieve Models  ****
******************************/

//get Product model
const PurchaseHistory = require('../models/purchase_history');
//retrieve Product model
const Product = require('../models/product');
//retrieve Product model
const User = require('../models/user');


/*
 * GET purchase history index
 */
router.get('/', (req, res) => {


    //find and render entire purchase history for all customers
    PurchaseHistory.find( (err, history) => {
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
router.get('/:id', (req, res) => {

    //retrive and store customer ID from request parameter
    let id = req.params.id;

    //search purchase history by customer ID
    PurchaseHistory.find({id: id}, (err, history) => {
        if (err)
            return console.log(err);

        //render purchase history for the specified customer
        res.render('admin/history', {
            purchase: history
        });

    });
});


//export module
module.exports = router;