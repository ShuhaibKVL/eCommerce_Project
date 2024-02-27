const mongoose = require("mongoose")
const Product = require('../model/Product')
const User = require('../model/UserSignup')
const Address = require('../model/Address')
const { Timestamp } = require("mongodb")

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
    Deliver_Address:{
        type:Object,
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
            type:Number,
            required:true
        },
        Price:{
            type:Number,
            required:true
        },
        OrderStatus:{
            type:String,
            default:"Placed"
        }
    }],
    OrderStatus:{
        type:String,
        default:"Placed"
    }
},{timestamps:true})

module.exports = mongoose.model('Order',OrderDb)