const mongoose = require("mongoose")
const Product = require('../model/Product')
const User = require('../model/UserSignup')
const Address = require('../model/Address')

const OrderDb = mongoose.Schema({
    UserId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required : true
    },
    OderId:{
        type:String
    },
    totalAmount:{
        type: String,
        required:true
    },
    Orderdate:{
        type:Date,
        default:Date.now,
        set: function (date) {
            // Set hours, minutes, seconds, and milliseconds to zero
            return new Date(date.setHours(0, 0, 0, 0));
        },
        get: function (date) {
            // Format the date to a string without time zone information
            return date.toLocaleDateString('en-US');
        },
    },
    Deliver_Address:{
        type:String,
        required:true
    },
    PaymentMethod:{
        type:String,
        required:true
    },
    PaymentId:{
        type:String
    },
    OrderItems:[{
        ProductId:{
            type:mongoose.Schema.Types.ObjectId,
            ref : 'Product',
            required:true
        },
        quantity:{
            type:String,
            required:true
        },
        Price:{
            type:Number,
            required:true
        },
        OrderStatus:{
            type:String,
            required:true
        }
    }]
})

module.exports = mongoose.model('Order',OrderDb)