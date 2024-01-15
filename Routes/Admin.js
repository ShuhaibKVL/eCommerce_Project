const express = require('express')
const AdmiNRoute = express()
const multer = require("multer")
const Path = require("path")

const Admincontroll = require('../control/AdminControll')
const { path } = require('./user')

const storageConfig = multer.diskStorage({
    destination: 'assets/uploads',
    filename : function(req,file,cb) {
        cb(null,file.fieldname + '_'+Date.now() + Path.extname(file.originalname))
    }
})

const upload = multer({ storage : storageConfig})

AdmiNRoute.set("view engine","ejs")
AdmiNRoute.set('views','./views/Admin')



AdmiNRoute.get('/',Admincontroll.Login)

AdmiNRoute.post('/',Admincontroll.isLogin)

AdmiNRoute.get('/DashBoard',Admincontroll.DashBoard )

AdmiNRoute.get('/UserDetails',Admincontroll.userDetails)

AdmiNRoute.get('/Block',Admincontroll.blockUser)

AdmiNRoute.get('/Product',Admincontroll.Product)

AdmiNRoute.get('/Add_Product',Admincontroll.Load_Add_Product)

AdmiNRoute.post('/Add_Product', upload.array('image',12),Admincontroll.Add_Product)

AdmiNRoute.get('/DeletProduct',Admincontroll.DeletProduct)

AdmiNRoute.get('/EditProduct',Admincontroll.LoadEditProduct)

AdmiNRoute.post('/EditProduct',upload.array('image',12),Admincontroll.EditProduct)

AdmiNRoute.get('/Category',Admincontroll.LoadCategory)

AdmiNRoute.post('/Category',Admincontroll.CreateCategory)

AdmiNRoute.get('/DeletCategory',Admincontroll.DeletCategory)

AdmiNRoute.get('/UnlistCategory',Admincontroll.UnlistCategory)

AdmiNRoute.get('/Cropper',(req,res) =>{
    res.render('Cropper')
})

module.exports = AdmiNRoute;
