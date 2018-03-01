/*******************************
********  Retrieve Modules  ****
********************************/

//use require keyword to refer and use express module
const express = require('express');
//define router
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
    PurchaseHistory.find((err, history) => {
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
    PurchaseHistory.find({ id: id }, (err, history) => {
        if (err)
            return console.log(err);

        //render purchase history for the specified customer
        res.render('admin/history', {
            purchase: history
        });

    });
});

/*
 * GET edit history
 */
router.get('/edit-history/:id', (req, res) => {

    let errors;

    //retrive and store history ID from request parameter
    let id = req.params.id;

    //create session error if there are errors
    if (req.session.errors)
        errors = req.session.errors;


    req.session.errors = null;


    //find purchase history by parameter ID
    PurchaseHistory.findById(id, (err, purchase) => {
        //if error redirect to admin history
        if (err) {
            console.log(err);
            res.redirect('/admin/history');

        } else {

            //render edit history page
            //pass current history information
            res.render('admin/edit_history', {
                id: purchase._id,
                buyer: purchase.buyer,
                errors: errors,
                title: purchase.title,
                quantity: purchase.quantity
            });
        }

    });
});



/*
 * POST edit history
 */
router.post('/edit-history/:id', (req, res) => {

    //store history item ID
    let id = req.params.id;

    //check request body values to make sure quantity has a value
    req.checkBody('quantity', 'Quantity must have a value.').isDecimal();

    //store request body quantity based on user input
    let quantity = req.body.quantity;

    //define errors based on validation errors
    let errors = req.validationErrors();

    //if errors define error in session
    //redirect to current edit history page
    if (errors) {

        req.session.errors = errors;
        res.redirect('/admin/history/edit-history/' + id);

    } else {
  
        //find the purchase history based on ID
        PurchaseHistory.findOne({ _id: id }, (err, purchase) => {
            if (err)
                console.log(err);

            //find matching product based on purchase product title
            Product.findOne({ slug: purchase.title }, (err, p) => {
                if (err)
                    console.log(err);

                //update product quantity based on quantity edit
                p.quantity -= quantity - purchase.quantity;

                //save product info
                p.save(function (err) {
                    if (err)
                        console.log(err);
                });

                //update purchase quantity
                purchase.quantity = quantity;

                //save updates
                purchase.save(function (err) {
                    if (err)
                        console.log(err);

                });

                //session flash success if successfully updated
                req.session.sessionFlash = {
                    type: 'success',
                    message: 'Purchase successfully edited!'
                }

                res.redirect('/admin/history/edit-history/' + id);
            });
        });
    }

});




/*
 * GET delete history
 */

//update product quantity on deletion
router.get('/delete-history/:id', (req, res) => {

    //retrieve and store product ID from params
    //store product image path
    let id = req.params.id;


    //find matching purchase history by id
    PurchaseHistory.findOne({ _id: id, }, (err, purchase) => {
        if (err)
            console.log(err);


        //store product title and quantitiy
        let productTitle = purchase.title;
        let productQuantity = purchase.quantity;


        //find product by title and add back quantity from deleted purchase
        Product.findOne({ slug: productTitle }, (err, p) => {
            //if error redirect to admin products list
            if (err)
                console.log(err);

            console.log(p.quantity);

            //update quantity for product
            p.quantity += productQuantity;

            //save updates
            p.save(function (err) {
                if (err)
                    console.log(err);

            });

            //remove purchase history
            PurchaseHistory.findByIdAndRemove(id, (err) => {
                console.log(err);
            });


        });
    });

    //session flash success if successfully deleted
    req.session.sessionFlash = {
        type: 'success',
        message: 'History item successfully deleted!'
    }

    res.redirect('/admin/history');



});


//export module
module.exports = router;