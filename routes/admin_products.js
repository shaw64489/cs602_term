/*******************************
********  Retrieve Modules  ****
********************************/

//use require keyword to refer and use express module
const express = require('express');
//define router
const router = express.Router();
//use require keyword to refer and use create directory module
const mkdirp = require('mkdirp');
//use require keyword to refer and use file system module
const fs = require('fs-extra');
//use require keyword to refer and use resize module
const resizeImg = require('resize-img');

/******************************
********  Retrieve Models  ****
******************************/

// Get Product model
const Product = require('../models/product');

// Get Category model
const Category = require('../models/category');


/*
 * GET products index
 */
router.get('/', (req, res) => {

    //used in view helper conditional statement
    let count = 0;

    //find product count
    Product.count( (err, c) => {
        count = c;
    });


    //find all products and pass to view to render all products
    Product.find( (err, products) => {
        res.render('admin/products', {
            products: products,
            count: count
        });
    });
});


/*
 * GET add product
 */
router.get('/add-product', (req, res) => {


    let title = "";
    let desc = "";
    let price = "";
    let quantity = "";

    //if errors render add product page
    //pass all categories for form dropdown list
    Category.find( (err, categories) => {

        res.render('admin/add_product', {

            title: title,
            desc: desc,
            categories: categories,
            price: price,
            quantity: quantity

        });
    });
});

/*
* Reference for image path - resize image
* author: James Halliday
* 2017
*/

/*
 * POST add product
 */
router.post('/add-product', (req, res) => {

    //type of file input named image - if not equal to undefined
    //it will either be provided image name or empty string
    let imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    //check request body values to make sure they have a value
    //use validator to display error below if empty
    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('quantity', 'Quantity must have a value.').isDecimal();


    //store request body information based on user input
    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();
    
    let category = req.body.category;
    let quantity = req.body.quantity;

    let desc = req.body.desc;
    let price = req.body.price;

    //define errors based on validation errors
    let errors = req.validationErrors();


    if (errors) {

        //if errors render add product page
        //pass all categories for form dropdown list
        Category.find( (err, categories) => {
            res.render('admin/add_product', {
                errors: errors,
                title: title,
                desc: desc,
                categories: categories,
                price: price,
                quantity: quantity
            });
        });

    } else {

        //determing if product already exists by user generated slug
        Product.findOne({
            slug: slug
        }, (err, product) => {
            if (product) {
                req.flash('danger', 'Product title exists, choose another.');
                Category.find( (err, categories) => {
                    res.render('admin/add_product', {
                        title: title,
                        categories: categories,
                        desc: desc,
                        price: price,
                        quantity: quantity
                    });
                });
            } else {

                //update price to correct format
                let priceUpdate = parseFloat(price).toFixed(2);

                //add product based on user input
                let product = new Product({
                    title: title,
                    slug: slug,
                    desc: desc,
                    price: priceUpdate,
                    category: category,
                    image: imageFile,
                    quantity: quantity
                });

                //save newly added product
                //on save we have access to product ID
                product.save( (err) => {
                    if (err)
                        return console.log(err);

                    //create image directories based on product ID
                    //gallery and thumbs
                    mkdirp('public/product_images/' + product._id, (err) => {
                        return console.log(err);
                    });

                    mkdirp('public/product_images/' + product._id + '/gallery', (err) => {
                        return console.log(err);
                    });

                    mkdirp('public/product_images/' + product._id + '/gallery/thumbs', (err) => {
                        return console.log(err);
                    });

                    //if image file isnt empty
                    if (imageFile != "") {

                        //store product image
                        let productImage = req.files.image;
                        //store product image path
                        let path = 'public/product_images/' + product._id + '/' + imageFile;

                        //pass image path and create the necessary directory
                        productImage.mv(path, (err) => {
                            return console.log(err);
                        });
                    }

                    //session flash success set
                    req.session.sessionFlash = {
                        type: 'success',
                        message: 'Product Added!'
                    }
                    res.redirect('/admin/products');
                });
            }
        });
    }

});

/*
 * GET edit product
 */
router.get('/edit-product/:id', function (req, res) {

    var errors;

    //create session error if there are errors
    if (req.session.errors)
        errors = req.session.errors;


    req.session.errors = null;

    //retrieve all of the categories
    Category.find(function (err, categories) {

        //find product by parameter ID
        Product.findById(req.params.id, function (err, p) {
            //if error redirect to admin products list
            if (err) {
                console.log(err);
                res.redirect('/admin/products');

            } else {

                //store gallery directory based on product ID
                var galleryDir = 'public/product_images/' + p._id + '/gallery';
                var galleryImages = null;

                //read the product gallery directory and check for files
                fs.readdir(galleryDir, function (err, files) {
                    if (err) {
                        console.log(err);
                    } else {

                        //store gallery images
                        galleryImages = files;

                        //render edit product page
                        //pass current product information
                        res.render('admin/edit_product', {
                            title: p.title,
                            errors: errors,
                            desc: p.desc,
                            categories: categories,
                            category: p.category.replace(/\s+/g, '-').toLowerCase(),
                            price: parseFloat(p.price).toFixed(2),
                            image: p.image,
                            galleryImages: galleryImages,
                            id: p._id,
                            quantity: p.quantity
                        });
                    }
                });
            }
        });
    });
});

/*
 * POST edit product
 */
router.post('/edit-product/:id', function (req, res) {

    //type of file input named image - if not equal to undefined
    //it will either be provided image name or empty string
    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    //check request body values to make sure they have a value
    //use validator to display error below if empty
    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);
    req.checkBody('quantity', 'Quantity must have a value.').isDecimal();

    //store request body information based on user input
    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    var pimage = req.body.pimage;
    var id = req.params.id;
    var quantity = req.body.quantity;

    //define errors based on validation errors
    var errors = req.validationErrors();

    //if errors define error in session
    //redirect to current edit product page
    if (errors) {
        req.session.errors = errors;
        res.redirect('/admin/products/edit-product/' + id);
    } else {

        //check that product title is unique
        //$ne selects the documents where the value of the field is not equal
        Product.findOne({
            slug: slug,
            _id: {
                '$ne': id
            }
        }, function (err, p) {
            if (err)

                console.log(err);

            if (p) {

                //session flash warning if title exists
                req.session.sessionFlash = {
                    type: 'error',
                    message: 'Product title exists, choose another.'
                }

                res.redirect('/admin/products/edit-product/' + id);

            } else {

                //if no issues - find product by ID and update with user input
                Product.findById(id, function (err, p) {
                    if (err)
                        console.log(err);

                    p.title = title;
                    p.slug = slug;
                    p.desc = desc;
                    p.price = parseFloat(price).toFixed(2);
                    p.quantity = parseFloat(quantity).toFixed(2);
                    p.category = category;
                    if (imageFile != "") {
                        p.image = imageFile;
                    }

                    //save updates
                    p.save(function (err) {
                        if (err)
                            console.log(err);

                        //if image file - product image - is not empty
                        //remove current and update with new image
                        if (imageFile != "") {
                            if (pimage != "") {
                                fs.remove('public/product_images/' + id + '/' + pimage, function (err) {
                                    if (err)
                                        console.log(err);
                                });
                            }

                            //update image and image path
                            var productImage = req.files.image;
                            var path = 'public/product_images/' + id + '/' + imageFile;

                            //pass image path and create the necessary directory
                            productImage.mv(path, function (err) {
                                return console.log(err);
                            });

                        }

                        //session flash success if successfully updated
                        req.session.sessionFlash = {
                            type: 'success',
                            message: 'Product successfully edited!'
                        }

                        res.redirect('/admin/products/edit-product/' + id);
                    });
                });
            }
        });
    }
});

/*
 * POST product gallery
 */
router.post('/product-gallery/:id', function (req, res) {

    //get the file
    var productImage = req.files.file;
    //store id from request parameter
    var id = req.params.id;
    //specify path to the gallery
    var path = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
    //specify path to the thumbs
    var thumbsPath = 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;

    //to save - pass path
    productImage.mv(path, function (err) {
        if (err)
            console.log(err);

        //format and save thumbnails
        //resize image
        //synchronously - path path - width and height set
        resizeImg(fs.readFileSync(path), {
            width: 100,
            height: 100
        }).then(function (buf) {
            //write thumbs pass thumbs path
            fs.writeFileSync(thumbsPath, buf);
        });
    });

    res.sendStatus(200);

});

/*
 * GET delete image
 */
router.get('/delete-image/:image', function (req, res) {

    //retrieve and store original and thumb image paths - image passed as parameter
    var originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
    var thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    //remove original and thumb
    fs.remove(originalImage, function (err) {
        if (err) {
            console.log(err);
        } else {
            fs.remove(thumbImage, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    
                    //session flash success if successfully deleted
                    req.session.sessionFlash = {
                        type: 'success',
                        message: 'Image successfully deleted!'
                    }

                    res.redirect('/admin/products/edit-product/' + req.query.id);
                }
            });
        }
    });
});



/*
 * GET delete product
 */
router.get('/delete-product/:id', function (req, res) {

    //retrieve and store product ID from params
    //store product image path
    var id = req.params.id;
    var path = 'public/product_images/' + id;

    //remove product image directory and product
    fs.remove(path, function (err) {
        if (err) {
            console.log(err);
        } else {
            Product.findByIdAndRemove(id, function (err) {
                console.log(err);
            });

            //session flash success if successfully deleted
            req.session.sessionFlash = {
                type: 'success',
                message: 'Product successfully deleted!'
            }

            res.redirect('/admin/products');
        }
    });

});

// Export module
module.exports = router;
