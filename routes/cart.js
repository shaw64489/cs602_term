const express = require('express');

const router = express.Router();

/******************************
********  Retrieve Models  ****
******************************/

//get Product model
const Product = require('../models/product');
//get Product model
const PurchaseHistory = require('../models/purchase_history');
//retrieve Product model
const User = require('../models/user');

/*
* Reference for cart sessions
* author: Daniel Deutsch
* 2017
*/

// GET add product to cart
//add some product
router.get('/add/:product', (req, res) => {

    let user = req.session.userId;
    let total;
    //store slug as product from param
    let slug = req.params.product;

    //where slug matches
    Product.findOne({ slug: slug }, (err, p) => {

        if (err) console.log(err);


        //check if session cart is defined
        //if not, define it and add the product
        if (typeof req.session.cart == 'undefined') {

            req.session.cart = [];
            //add object to cart
            req.session.cart.push({
                title: slug,
                price: parseFloat(p.price).toFixed(2),
                //grab path for product image
                image: '/product_images/' + p._id + '/' + p.image,
                qty: 1,
                user: user
            });
            //else if cart exists
        } else {

            //either add new product or increment existing product
            let userCart = req.session.cart;
            let newItem = true;

            //loop through cart array
            for (var i = 0; i < userCart.length; i++) {

                //check if a title inside cart is equal
                if (userCart[i].title == slug) {
                    //increment existing product quantity
                    userCart[i].qty++;
                    newItem = false;
                    //break if match is found
                    break;
                }

            }
            //check if new item is still true, if so add new item
            if (newItem) {

                userCart.push({
                    title: slug,
                    qty: 1,
                    price: parseFloat(p.price).toFixed(2),
                    //grab path for product image
                    image: '/product_images/' + p._id + '/' + p.image,
                    user: user
                });

            }

        }

        //success message display for cart update
        //redirect to previous request
        req.session.sessionFlash = {
            type: 'success',
            message: 'Cart updated!'
        }
        res.redirect('back')
    });
});


// GET checkout
router.get('/checkout', (req, res) => {

    //render checkout with session cart - user ID
    res.render('checkout', {
        title: 'Checkout Cart',
        cart: req.session.cart,
        user: req.session.userId
    });

});

/*
* GET update product
*/
router.get('/update/:product', (req, res) => {


    //store product, cart, action(add,delete,clear) from param/session/query
    let slug = req.params.product;
    let userCart = req.session.cart;
    let action = req.query.action;

    //loop through cart
    for (var i = 0; i < userCart.length; i++) {

        //if title matches
        if (userCart[i].title == slug) {

            //add and update product quantity in cart
            if(action == "add") {
                userCart[i].qty++;

            //subtract and update product quantity in cart
            //if product qty is now 0, remove from cart
            } else if (action == "remove") {

                userCart[i].qty--;
                    if (userCart[i].qty < 1)
                    userCart.splice(i, 1);

            //clear and delete cart
            } else if (action == "clear") {

                userCart.splice(i, 1);
                if (userCart.length == 0)
                    delete req.session.cart;
            }
            
        }
    }

    //flash message that cart updated
    req.session.sessionFlash = {
        type: 'success',
        message: 'Cart has been updated!'
    }

    res.redirect('/cart/checkout');
});

/*
 * GET clear cart
 */
router.get('/clear', (req, res) => {

    //delete cart session
    delete req.session.cart;

    //flash messgae that cart session is deleted
    req.session.sessionFlash = {
        type: 'success',
        message: 'Cart has been cleared!'
    }

    res.redirect('/cart/checkout');

});

/*
 * GET buy now
 */
router.get('/buy/:user', (req, res) => {

    //retrieve user ID from request parameter
    let user = req.params.user;

    //loop through session cart
    for (let i = 0; i < req.session.cart.length; i++) {

        //store cart item title
        let slug = req.session.cart[i].title;

        //store cart item quantity
        let quantity = req.session.cart[i].qty;

        //find a matching product title and subtract based on cart quantity
        Product.findOne({ slug: slug }, (err, product) => {

            if (err)
                console.log(err);

            //subtract quantity
            product.quantity -= quantity;

            //save update
            product.save(function (err) {
                if (err)
                    return console.log(err);
            });

            let name = "";

            //find purchase user by id
            User.findOne({ _id: user }, (err, user) => {
                if (err)
                    console.log(err);

                //gather user name
                name = user.name;

                //gather date of purchase, convert to string
                var date = new Date().toDateString()

                //create purchase history based on this purchase - line by line
                var purchase_history = new PurchaseHistory({
                    id: user._id,
                    buyer: name,
                    title: product.slug,
                    quantity: quantity,
                    date: date
                });

                //save purchase history item
                purchase_history.save( (err) => {
                    if (err)
                        return console.log(err);

                });
            });
        });

    }

    //flash message of successful order submission
    req.session.sessionFlash = {
        type: 'success',
        message: 'Order has been submitted!'
    }

    //delete current cart session
    delete req.session.cart;

    //redirect to user profile
    res.redirect('../../profile');

});

//exports
module.exports = router;