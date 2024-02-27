const { Timestamp } = require('mongodb')
const mongoose = require('mongoose')

const couponSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    couponCode:{
        type:String,
        required:true
    },
    discountType:{
        type:String,
        required:true
    },
    discount:{
        type:Number,
        required:true
    },
    instruction:{
        type:String,
        required:false
    },
    userId:{
        type:String,
        required:false
    },
    isList:{
        type:Boolean,
        default:false
    },
    expireDate:{
        type:Date,
        required:true,
        timeZone: 'none'
    }
},{timestamps:true})

module.exports = mongoose.model('coupon',couponSchema)