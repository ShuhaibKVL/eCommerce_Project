const mongoose = require('mongoose')
const { stringify } = require('uuid')
const Product = require('../model/Product')

const whishList = mongoose.Schema({
    UserId : {
        type:String,
        required:true
    },
    Product:[{
        ProductId:{
            type:mongoose.Schema.Types.ObjectId,
            ref : 'Product',
            required:true
        }
    }]
})

module.exports = mongoose.model('whishList',whishList)