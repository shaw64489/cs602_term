var mongoose = require('mongoose');

// Product schema
var PurchaseHistorySchema = mongoose.Schema ({

    id: {
        type: String,
        required: true
    }, 
    buyer: {
        type: String,
        required: true
    }, 
    title: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    date: {
        type: String,
        required: true
    }

});

var PurchaseHistory = module.exports = mongoose.model('purchasehistory', PurchaseHistorySchema);