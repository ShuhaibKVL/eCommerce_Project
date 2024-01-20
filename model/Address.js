const mongoose = require('mongoose')
const { stringify } = require('uuid')

const userAddress = mongoose.Schema({
    FirstName : {
        type:String,
        required:true
    },
    LastName : {
        type:String,
        required:true
    },
    PhoneNumber : {
        type:Number,
        required:true
    },
    Email : {
        type:String,
        required:true
    },
    Country : {
        type:String,
        required:true
    },
    State : {
        type:String,
        required:true
    },
    District : {
        type:String,
        required:true
    },
    add1: {
        type:String,
        required:true
    },
    add2: {
        type:String,
        required:true
    },
    Town: {
        type:String,
        required:true
    },
    PinCode: {
        type:Number,
        required:true
    },
    UserId : {
        type:String,
        required:true
    }
})

module.exports = mongoose.model('Address',userAddress)