/*******************************
********  Retrieve Modules  ****
********************************/

//use require keyword to refer and use express module
const express = require('express');
//define router
const router = express.Router();
const app = express();

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
* GET - API for retrieving all products
* JSON and XML
*/
router.get('/:format/products', (req, res) => {


    //store parameter data format 
    let format = req.params.format;

    //search and return all products
    let products = Product.find((err, products) => {

         //if no product match return error message
        if (products == null) {

            res.status(404);
            res.send("<b>Error! - Products Not Found</b>");
            
        }

        //if match and format json
        else if (format == 'json') {

            //return json product data
            res.format({

                'application/json': () => {
                    console.log(products);
                    res.json(products);
                }
            });

        //if match and format xml
        } else if (format == 'xml') {

            //return xml product data
            res.format({

                'application/xml': () => {

                    var productList = '<?xml version="1.0"?>\n';
                    productList += '<products>\n';

                    //loop through products and store xml list
                    for (var i = 0; i < products.length; i++) {
                        productList +=
                            ' <product id="' + products[i].id + '">\n' +
                            '<title>' + products[i].title + '</title>\n'
                            + '<slug>' + products[i].slug + '</slug>\n'
                            + '<desc>' + products[i].desc + '</desc>\n'
                            + '<price>' + products[i].price + '</price>\n'
                            + '<category>' + products[i].category + '</category>\n'
                            + '<image>' + products[i].image + '</image>\n'
                            + '<quantity>' + products[i].quantity + '</quantity>\n'
                            + '</product>\n';
                    }
                    productList += '</products>';
                    res.type('application/xml');
                    res.send(productList);
                }
            });
        
        //final no match error message
        } else {

            res.format({

                'default': () => {
                    res.status(404);
                    res.send("<b>404 - Not Found</b>");
                }
            });
        }


    });

});

/*
* GET - API for retrieving product by title
* JSON and XML
*/
router.get('/:format/:title', (req, res) => {

    //store parameter data
    //format and product title
    let format = req.params.format;
    let title = req.params.title;

    //search product matching title
    let products = Product.findOne({ slug: title }, (err, products) => {

        //if no product match return error message
        if (products == null) {

            res.status(404);
            res.send("<b>Error! - Product Not Found</b>");
            
        }

        //if match and format json
        else if (format == 'json') {

            //return json product data
            res.format({

                'application/json': () => {
                    console.log(products);
                    res.json(products);
                }
            });

        //if match and format xml
        } else if (format == 'xml') {

            //return xml product data
            res.format({

                'application/xml': () => {

                    var productList = '<?xml version="1.0"?>\n';

                    productList +=
                        ' <product id="' + products.id + '">\n' +
                        '<title>' + products.title + '</title>\n'
                        + '<slug>' + products.slug + '</slug>\n'
                        + '<desc>' + products.desc + '</desc>\n'
                        + '<price>' + products.price + '</price>\n'
                        + '<category>' + products.category + '</category>\n'
                        + '<image>' + products.image + '</image>\n'
                        + '<quantity>' + products.quantity + '</quantity>\n'
                        + '</product>\n';

                    res.type('application/xml');
                    res.send(productList);
                }
            });
        
        //final no match error message
        } else {

            res.format({

                'default': () => {
                    res.status(404);
                    res.send("<b>404 - Not Found</b>");
                }
            });
        }


    });

});

/*
* GET - API for retrieving product within a given price range
* JSON and XML
*/
router.get('/:format/price/:min/:max', (req, res) => {

    //store parameter data
    //format, minimun and maximum price values
    let format = req.params.format;
    let min = req.params.min;
    let max = req.params.max;

    //search products withing a price range
    //greater than min and less than max
    let products = Product.find({ price: { $gte: min, $lte: max } }, (err, products) => {

        //if no products match return error message
        if (products == null) {

            res.status(404);
            res.send("<b>Error! - Products Not Found</b>");
            
        }

        //if match and format json
        else if (format == 'json') {

            //return json product data
            res.format({

                'application/json': () => {
                    console.log(products);
                    res.json(products);
                }
            });

        //if match and format xml
        } else if (format == 'xml') {

            //return xml product data
            res.format({

                'application/xml': () => {

                    var productList = '<?xml version="1.0"?>\n';
                    productList += '<products>\n';

                    for (var i = 0; i < products.length; i++) {
                        productList +=
                            ' <product id="' + products[i].id + '">\n' +
                            '<title>' + products[i].title + '</title>\n'
                            + '<slug>' + products[i].slug + '</slug>\n'
                            + '<desc>' + products[i].desc + '</desc>\n'
                            + '<price>' + products[i].price + '</price>\n'
                            + '<category>' + products[i].category + '</category>\n'
                            + '<image>' + products[i].image + '</image>\n'
                            + '<quantity>' + products[i].quantity + '</quantity>\n'
                            + '</product>\n';
                    }
                    productList += '</products>';
                    res.type('application/xml');
                    res.send(productList);
                }
            });
        
        //final no match error message
        } else {

            res.format({

                'default': () => {
                    res.status(404);
                    res.send("<b>404 - Not Found</b>");
                }
            });
        }


    });

});

//export module
module.exports = router;

