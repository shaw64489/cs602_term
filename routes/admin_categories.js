/*
* Reference for flash implementation
* author: Brian MacArthur
* 2017
*/

const express = require('express');
const router = express.Router();

/******************************
********  Retrieve Models  ****
******************************/

//retrieve Category model
const Category = require('../models/category');

//retrieve Product model
const Product = require('../models/product');


/*
 * GET category index
 */
router.get('/', (req, res) => {

    //find all categories
 Category.find( (err, categories) => {
    if (err)
        return console.log(err);
    //render admin categories view
    //pass all categories
    res.render('admin/categories', {
        categories: categories
    });
});

});

/*
* GET add category
*/

router.get('/add-category', (req, res) => {

    //render add category view
    res.render('admin/add_category', {

    });

});

// POST add category
router.post('/add-category', (req, res) => {

    //check request body title to make sure it has a value
    //use validator to display error below if empty
    req.checkBody('title', 'Title must have a value.').notEmpty();

    //store request body title
    //create slug based on user title - remove spaces convert to lower case
    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();

    //define errors based on validation errors
    let errors = req.validationErrors();

    //if erros render add category page with errors
    if (errors) {
        console.log('errors-blank');
        res.render('admin/add_category', {
            errors: errors
        });
    } else {

        //check if slug already exists
        Category.findOne({ slug: slug }, (err, category) => {

            //if category already exists
            //display flash warning below
            if (category) {

                //session flash warning set
                req.session.sessionFlash = {
                    type: 'warning',
                    message: 'Category title exists, choose another.'
                }
                
                //redirect to add category page
                res.redirect('/admin/categories/add-category');
            } else {

                //if no issue create new category
                //set title and slug based on user input
                let category = new Category({
                    title: title,
                    slug: slug
                });

                //save category
                category.save((err) => {
                    if (err) return console.log(err);

                    //add category to global locals
                    Category.find(function (err, categories) {

                        if (err) {
                            console.log(err);
                        } else {
                            //set global categories
                            req.app.locals.categories = categories;
                        }

                    });


                    //flash message on successful category addition
                    req.session.sessionFlash = {
                        type: 'success',
                        message: 'Category added!'
                    }
                    //redirect to admin categories list
                    res.redirect('/admin/categories');
                });
            }
        });
    }
});


/*
 * GET edit category
 */
router.get('/edit-category/:id', (req, res) => {

    //store category id from request param
    let editId = req.params.id;

    //find the right category based on the passed ID
    Category.findById(editId, (err, category) => {
        if (err)
            return console.log(err);

        //render edit category view with category title
        res.render('admin/edit_category', {
            title: category.title,
            id: category._id
        });
    });

});


/*
 * POST edit category
 */
router.post('/edit-category/:id', (req, res) => {

    //check request body title to make sure it has a value
    //use validator to display error below if empty
    req.checkBody('title', 'Title must have a value.').notEmpty();

    //store request body title
    //create slug based on user title - remove spaces convert to lower case
    let editTitle = req.body.title;
    let editSlug = editTitle.replace(/\s+/g, '-').toLowerCase();
    //store category ID
    let id = req.params.id;

    //define errors based on validation errors
    let errors = req.validationErrors();

    if (errors) {

        res.render('admin/edit_category', {
            errors: errors,
            title: editTitle,
            id: id
        });
    } else {

        //check that title is unique
        //$ne selects the documents where the value of the field is not equal
        Category.findOne({ slug: editSlug, _id: { '$ne': id } }, (err, category) => {
            if (category) {

                //flash message on if category title exists
                //redirect back to edit category
                req.session.sessionFlash = {
                    type: 'warning',
                    message: 'Category title already exists, please choose another.'
                }
                res.redirect('/admin/categories/edit-category/' + id);
            
            
            } else {

                //if everything is ok - find the category by ID
                Category.findById(id, (err, category) => {
                    if (err)
                        return console.log(err);
                    
                    //store original category slug 
                    //will be used to update product category properties
                    let original = category.slug;
                    //update category title to new title
                    category.title = editTitle;
                    //update category slug to new slug
                    category.slug = editSlug;

                    //save category
                    category.save( (err) => {
                        if (err)
                            return console.log(err);

                        //add category to global locals
                        Category.find( (err, categories) => {

                            if (err) {
                                console.log(err);
                            } else {
                                //set global categories
                                req.app.locals.categories = categories;
                            }

                        });

                        //Update Products with Same Category based on edit 
                        //search using the original category slug
                        Product.find({ category: original }, (err, p) => {

                            if (err)
                                console.log(err);

                            //loop through the products with matching category
                            //update category to new category edit
                            for (let i = 0; i < p.length; i++) {

                                p[i].category = editSlug;

                                //save update to product
                                p[i].save( (err) => {
                                    if (err)
                                        return console.log(err);
                                });
                            }

                        });

                        //flash message on successful category edit
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
router.get('/delete-category/:id', (req, res) => {

    //find category by the passed id request paramterand remove category
    Category.findByIdAndRemove(req.params.id, (err) => {
        if (err)
            return console.log(err);

        //update category global locals
        Category.find( (err, categories) => {

            if (err) {
                console.log(err);
            } else {
                //set global categories
                req.app.locals.categories = categories;
            }

        });

        //flash message on successful category deletion
        req.session.sessionFlash = {
            type: 'success',
            message: 'Category deleted'
        }

        //redirect to admin category page
        res.redirect('/admin/categories/');
    });

});



//exports
module.exports = router;