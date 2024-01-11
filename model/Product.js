const mongoose = require("mongoose")

const ProductData = mongoose.Schema ({

    Name : {
        type : String,
        required : true
    },
    Price : {
        type : String,
        required : true
    },
    Category : {
        type : String,
        required : true
    },
    Size : {
        type : String,
        required : true
    },
    Stock : {
        type : String,
        required : false
    },
    Description : {
        type : String,
        required : false
    },
    Image : {
        type : Array,
        required : true
    }
})

module.exports = mongoose.model('Product',ProductData)