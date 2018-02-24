var mongoose = require('mongoose');

//use require keyword to refer and use underscore module
var _ = require('underscore');

// Product schema
var ProductSchema = mongoose.Schema ({

    title: {
        type: String,
        required: true
    }, 
    slug: {
        type: String
    },
    desc: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String
    },
    quantity: {
        type: Number,
        required: true
    }

});

var Product = module.exports = mongoose.model('Product', ProductSchema);

