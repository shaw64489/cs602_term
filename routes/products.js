/*******************************
********  Retrieve Modules  ****
********************************/

//use require keyword to refer and use express module
const express = require('express');
//define router
const router = express.Router();
//use require keyword to refer and use file system module
const fs = require('fs-extra');

/******************************
********  Retrieve Models  ****
******************************/

// Get Product model
const Product = require('../models/product');

// Get Category model
const Category = require('../models/category');

/*
 * GET all products
 */
router.get('/', (req, res) => {

    //find all products and render all products on page
    Product.find( (err, products) => {
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
router.get('/:category', (req, res) => {

    //retrieve and store category slug
    let categorySlug = req.params.category;

    //find the category that matches by slug
    Category.findOne({slug: categorySlug}, (err, category) => {

        //find all products in that matching category
        Product.find({category: categorySlug}, (err, products) => {

            if (err)
                console.log(err);

            res.render('cat_products', {
                title: category.title,
                products: products
            });
        });
    });
});


/*
 * GET product details
 */
router.get('/:category/:product', (req, res) => {

    let galleryImages = null;

    //find product that matches
    Product.findOne({slug: req.params.product}, (err, product) => {
        if (err) {
            console.log(err);
        } else {


            //get the gallery directory
            let galleryDir = 'public/product_images/' + product._id + '/gallery';

            //read the gallery directory
            //callback files
            fs.readdir(galleryDir, (err, files) => {
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

// Export module
module.exports = router;


