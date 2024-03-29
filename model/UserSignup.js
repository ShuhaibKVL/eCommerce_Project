const mongoose = require("mongoose")
const Product = require('../model/Product')

const UserSchema = mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phoneNumber:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },isBlocked:{
        type:Boolean,
        default:false
    },
    cart: [{
        product :{type: mongoose.Schema.Types.ObjectId , ref: 'Product'},
        quantity:{type: Number,default:1 }
    }]

})

   // Method to clear the user's cart
    UserSchema.methods.clearCart = function() {
        this.cart = []
        return this.save()
}

module.exports = mongoose.model('User',UserSchema)