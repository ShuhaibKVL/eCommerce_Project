const mongoose = require('mongoose')
const { stringify } = require('uuid')

const whishList = mongoose.Schema({
    UserId : {
        type:String,
        required:true
    },
    ProductId:{
        type:mongoose.Schema.Types.ObjectId,
        ref : 'Product',
        required:true
    }
})

module.exports = mongoose.model('whishList',whishList)