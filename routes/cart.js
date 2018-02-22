var express = require('express');

var router = express.Router();

//get Product model
var Product = require('../models/product');

//get Product model
var PurchaseHistory = require('../models/purchase_history');

//retrieve Product model
const User = require('../models/user');

/*
* Reference for cart sessions
* author: Vojislav Kovacevic
* 2017
*/

// GET add product to cart
//add some product
router.get('/add/:product', (req, res) => {

    var user = req.session.userId;
    var total;
    //store slug as product from param
    var slug = req.params.product;

    //where slug matches
    Product.findOne({ slug: slug }, function (err, p) {

        if (err) console.log(err);


        //check if session cart is defined
        //if not, define it and add the product
        if (typeof req.session.cart == 'undefined') {

            req.session.cart = [];
            //add object to cart
            req.session.cart.push({
                title: slug,
                qty: 1,
                price: parseFloat(p.price).toFixed(2),
                //grab path for product image
                image: '/product_images/' + p._id + '/' + p.image,
                user: user
            });
            //else if cart exists
        } else {

            //either add new product or increment existing product
            var cart = req.session.cart;
            var newItem = true;

            //loop through cart array
            for (var i = 0; i < cart.length; i++) {

                //check if a title inside cart is equal
                if (cart[i].title == slug) {
                    //increment existing product quantity
                    cart[i].qty++;
                    newItem = false;
                    //break if match is found
                    break;
                }

            }
            //check if new item is still true, if so add new item
            if (newItem) {

                cart.push({
                    title: slug,
                    qty: 1,
                    price: parseFloat(p.price).toFixed(2),
                    //grab path for product image
                    image: '/product_images/' + p._id + '/' + p.image,
                    user: user
                });

            }

        }



        //console.log(req.session.cart);
        //redirect to previous request
        req.session.sessionFlash = {
            type: 'success',
            message: 'Cart updated!'
        }

        res.redirect('back')

    });

});


// GET checkout
//add some product
router.get('/checkout', (req, res) => {

    res.render('checkout', {
        title: 'Checkout Cart',
        cart: req.session.cart,
        user: req.session.userId
    });

});

/*
* GET update product
*/
router.get('/update/:product', function (req, res) {



    var slug = req.params.product;
    var cart = req.session.cart;
    var action = req.query.action;

    for (var i = 0; i < cart.length; i++) {
        if (cart[i].title == slug) {
            switch (action) {
                case "add":
                    cart[i].qty++;
                    break;
                case "remove":
                    cart[i].qty--;
                    if (cart[i].qty < 1)
                        cart.splice(i, 1);
                    break;
                case "clear":
                    cart.splice(i, 1);
                    if (cart.length == 0)
                        delete req.session.cart;
                    break;
                default:
                    console.log('update problem');
                    break;
            }
            break;
        }
    }

    req.session.sessionFlash = {
        type: 'success',
        message: 'Cart updated!'
    }
    res.redirect('/cart/checkout');

});

/*
 * GET clear cart
 */
router.get('/clear', function (req, res) {

    delete req.session.cart;

    req.session.sessionFlash = {
        type: 'success',
        message: 'Cart cleared!'
    }

    res.redirect('/cart/checkout');

});

/*
 * GET buy now
 */
router.get('/buy/:user', function (req, res) {

    var user = req.params.user;

    for (var i = 0; i < req.session.cart.length; i++) {

        var slug = req.session.cart[i].title;
        console.log(slug);
        var quantity = req.session.cart[i].qty;
        console.log(quantity);
        console.log(user);
        Product.findOne({ slug: slug }, function (err, p) {
            if (err)
                console.log(err);

            console.log(p);

            p.quantity -= quantity;
            console.log(p);
            p.save(function (err) {
                if (err)
                    return console.log(err);
            });




            var name = "";

            User.findOne({ _id: user }, function (err, user) {
                if (err)
                    console.log(err);

                name = user.name;

                console.log(p);
                var d = new Date().toDateString()
                console.log(d);

                var purchase_history = new PurchaseHistory({
                    id: user._id,
                    buyer: name,
                    title: p.slug,
                    quantity: quantity,
                    date: d
                });

                purchase_history.save(function (err) {
                    if (err)
                        return console.log(err);


                });
            });
        });

    }
    req.session.sessionFlash = {
        type: 'success',
        message: 'Order Submitted!'
    }

    delete req.session.cart;

    res.redirect('../../profile');

});







//exports
module.exports = router;