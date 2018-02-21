var express = require('express');
var router = express.Router();
var fs = require('fs-extra');


// Get Product model
var Product = require('../models/product');

// Get Category model
var Category = require('../models/category');

/*
 * GET all products
 */
router.get('/', function (req, res) {
//router.get('/', isUser, function (req, res) {

    Product.find(function (err, products) {
        if (err)
            console.log(err);

        res.render('all_products', {
            title: 'All products',
            products: products
        });
    });

});


/*
 * GET products by category
 */
router.get('/:category', function (req, res) {

    var categorySlug = req.params.category;

    Category.findOne({slug: categorySlug}, function (err, c) {
        Product.find({category: categorySlug}, function (err, products) {
            if (err)
                console.log(err);

            res.render('cat_products', {
                title: c.title,
                products: products
            });
        });
    });

});

/*
 * GET product details
 */
router.get('/:category/:product', function (req, res) {

    var galleryImages = null;

    //find product that matches
    Product.findOne({slug: req.params.product}, function (err, product) {
        if (err) {
            console.log(err);
        } else {

            console.log(product._id);

            //get the gallery directory
            var galleryDir = 'public/product_images/' + product._id + '/gallery';

            //read the gallery directory
            //callback files
            fs.readdir(galleryDir, function (err, files) {
                if (err) {
                    console.log(err);
                } else {

                    //if it can be read store files
                    galleryImages = files;

                    //title, product itself, gallery images
                    res.render('product', {
                        title: product.title,
                        p: product,
                        galleryImages: galleryImages
                    });
                }
            });
        }
    });

});

// Exports
module.exports = router;


