/*
* Reference for flash implementation
* author: Vojislav Kovacevic
* 2017
*/

var express = require('express');

var router = express.Router();

//retrieve Category model
const Category = require('../models/category');

//retrieve Product model
const Product = require('../models/product');


/*
 * GET category index
 */
router.get('/', function (req, res) {
    Category.find(function (err, categories) {
        if (err)
            return console.log(err);
        res.render('admin/categories', {
            categories: categories
        });
    });
});

/*
* GET add category
*/


router.get('/add-category', (req, res) => {

    var title = "";


    res.render('admin/add_category', {
        title: title
    });

});

// POST add category
router.post('/add-category', (req, res) => {

    req.checkBody('title', 'Title must have a value.').notEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();

    if (errors) {
        console.log('errors-blank');
        res.render('admin/add_category', {
            errors: errors,
            title: title
        });
    } else {

        //check if slug exists
        Category.findOne({ slug: slug }, (err, category) => {

            if (category) {
                console.log('dup');


                req.session.sessionFlash = {
                    type: 'warning',
                    message: 'Category title exists, choose another.'
                }
                /*
                res.render('admin/add_category', {
                    title: title,

                });*/
                res.redirect('/admin/categories/add-category');
            } else {

                var category = new Category({
                    title: title,
                    slug: slug
                });

                category.save((err) => {
                    if (err) return console.log(err);

                    Category.find(function (err, categories) {

                        if (err) {
                            console.log(err);
                        } else {
                            //set global categories
                            req.app.locals.categories = categories;
                        }

                    });


                    req.session.sessionFlash = {
                        type: 'success',
                        message: 'Category added!'
                    }
                    res.redirect('/admin/categories');
                });
            }

        });

    }



});


/*
 * GET edit category
 */
router.get('/edit-category/:id', function (req, res) {

    var id = req.params.id;

    Category.findById(id, function (err, category) {
        if (err)
            return console.log(err);

        res.render('admin/edit_category', {
            title: category.title,
            id: category._id
        });
    });

});


/*
 * POST edit category
 */
router.post('/edit-category/:id', function (req, res) {

    req.checkBody('title', 'Title must have a value.').notEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var id = req.params.id;



    var errors = req.validationErrors();

    if (errors) {

        res.render('admin/edit_category', {
            errors: errors,
            title: title,
            id: id
        });
    } else {
        //check that title is unique
        Category.findOne({ slug: slug, _id: { '$ne': id } }, function (err, category) {
            if (category) {

                req.session.sessionFlash = {
                    type: 'warning',
                    message: 'Category title already exists, please choose another.'
                }
                res.render('admin/edit_category', {
                    title: title,
                    id: id
                });
            } else {

                Category.findById(id, function (err, category) {
                    if (err)
                        return console.log(err);
                    var original = category.slug;
                    category.title = title;
                    category.slug = slug;

                    category.save(function (err) {
                        if (err)
                            return console.log(err);

                        Category.find(function (err, categories) {

                            if (err) {
                                console.log(err);
                            } else {
                                //set global categories
                                req.app.locals.categories = categories;
                            }

                        });
                        /* Update Products with Same Category based on edit */

                        Product.find({ category: original }, function (err, p) {

                            if (err)
                                console.log(err);

                            for (let i = 0; i < p.length; i++) {

                                p[i].category = slug;

                                p[i].save(function (err) {
                                    if (err)
                                        return console.log(err);
                                });
                            }



                        });

                        req.session.sessionFlash = {
                            type: 'success',
                            message: 'Success editing Category!'
                        }
                        res.redirect('/admin/categories/edit-category/' + id);
                    });

                });


            }
        });
    }

});

/*
 * GET delete category
 */
router.get('/delete-category/:id', function (req, res) {

    Category.findByIdAndRemove(req.params.id, function (err) {
        if (err)
            return console.log(err);

        Category.find(function (err, categories) {

            if (err) {
                console.log(err);
            } else {
                //set global categories
                req.app.locals.categories = categories;
            }

        });

        req.session.sessionFlash = {
            type: 'success',
            message: 'Category deleted'
        }
        res.redirect('/admin/categories/');
    });

});



//exports
module.exports = router;