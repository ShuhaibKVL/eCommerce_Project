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
        type : Number,
        required : true
    },
    Description : {
        type : String,
        required : false
    },
    Image : {
        type : Array,
        required : true
    },
    isList:{
        type:Boolean,
        default:false
    }
})

module.exports = mongoose.model('Product',ProductData)