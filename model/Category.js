const mongoose = require('mongoose')

const CategorySchema = mongoose.Schema ({
    Name:{
        type:String,
        required:true
    },
    Description:{
        type:String,
        required:true
    },
    IsList:{
        type:Boolean,
        default:false
    }
})

module.exports = mongoose.model('Category',CategorySchema)