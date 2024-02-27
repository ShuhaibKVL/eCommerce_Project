const mongoose = require('mongoose')

const wallet = mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    balance:{
        type:Number,
        required:true
    },
    history:[{
        date:{
            type:String,
            required:true
        },
        description:{
            type:String,
            required:false
        },
        transaction:{
            type:String,
            required:true
        },
        amount:{
            type:Number,
            required:true
        },
    }]
})

module.exports = mongoose.model('wallet',wallet)