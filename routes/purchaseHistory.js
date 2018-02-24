const express = require('express');

const router = express.Router();

/******************************
********  Retrieve Models  ****
******************************/

//get Product model
const PurchaseHistory = require('../models/purchase_history');

//retrieve Product model
const Product = require('../models/product');

//retrieve Product model
const User = require('../models/user');



/*
 * GET purchase history for current user
 */
router.get('/:id', (req, res) => {

    //retrieve and store user ID from request parameter
    var id = req.params.id;

    //search through purchase history to find the users full history based on ID
    PurchaseHistory.find({id: id}, (err, history) => {

        if (err)
            return console.log(err);

        //render user history
        res.render('history', {
            purchase: history
        });

    });
});


//export module
module.exports = router;