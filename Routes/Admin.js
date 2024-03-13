const express = require('express')
const AdmiNRoute = express()
const session = require('express-session')
const { v4 :uuidv4} = require('uuid')
const multer = require("multer")
const Path = require("path")
const adminAuth = require('../Midlleware/AdminAuth')
const nocache = require("nocache")

const Admincontroll = require('../control/AdminControll')
const { path } = require('./user')
const { isLogout } = require('../Midlleware/UserAuth')

AdmiNRoute.use(session({secret:uuidv4(),resave:false,saveUninitialized:false}))

AdmiNRoute.use(session({
    secret: process.env.SESSION_SC_ADMIN,
    resave: false,
    saveUninitialized: true
}))

const storageConfig = multer.diskStorage({
    destination: 'assets/uploads',
    filename : function(req,file,cb) {
        cb(null,file.fieldname + '_'+Date.now() + Path.extname(file.originalname))
    }
})

const upload = multer({ storage : storageConfig})

AdmiNRoute.set("view engine","ejs")
AdmiNRoute.set('views','./views/Admin')

AdmiNRoute.get('/',nocache(),adminAuth.isLogin,Admincontroll.Login)

AdmiNRoute.post('/',Admincontroll.loginValidation)

AdmiNRoute.get('/DashBoard',nocache(),adminAuth.isLogout,Admincontroll.DashBoard )

AdmiNRoute.get('/adminLogout',Admincontroll.adminLogout)

AdmiNRoute.get('/UserDetails',adminAuth.isLogout,Admincontroll.userDetails)

AdmiNRoute.get('/Block',adminAuth.isLogout,Admincontroll.blockUser)

AdmiNRoute.get('/Product',adminAuth.isLogout,Admincontroll.Product)

AdmiNRoute.get('/Add_Product',adminAuth.isLogout,Admincontroll.Load_Add_Product)

AdmiNRoute.post('/Add_Product', upload.array('image',4),Admincontroll.Add_Product)

AdmiNRoute.get('/DeletProduct',Admincontroll.DeletProduct)

AdmiNRoute.get('/EditProduct',adminAuth.isLogout,Admincontroll.LoadEditProduct)

AdmiNRoute.post('/EditProduct',upload.array('image',4),Admincontroll.EditProduct)

AdmiNRoute.get('/Category',adminAuth.isLogout,Admincontroll.LoadCategory)

AdmiNRoute.post('/Category',Admincontroll.CreateCategory)

AdmiNRoute.get('/DeletCategory',adminAuth.isLogout,Admincontroll.DeletCategory)

AdmiNRoute.get('/UnlistCategory',adminAuth.isLogout,Admincontroll.UnlistCategory)

AdmiNRoute.get('/OrderManagment',adminAuth.isLogout,Admincontroll.OrderManagment)

AdmiNRoute.get('/RefreshOrderManagement',adminAuth.isLogout,Admincontroll.RefreshOrderManagement)

AdmiNRoute.patch('/Approve_cancel_order',Admincontroll.Approve_cancel_order)

AdmiNRoute.patch('/Delivered',Admincontroll.Delivered)

AdmiNRoute.patch('/Order_Return',Admincontroll.Order_Return)

AdmiNRoute.get('/orderDetails',Admincontroll.orderDetails)

AdmiNRoute.get('/loadCoupon',adminAuth.isLogout,Admincontroll.loadCoupon)

AdmiNRoute.post('/addNewCoupon',Admincontroll.addNewCoupon)

AdmiNRoute.get('/DeleteCoupon',Admincontroll.DeleteCoupon)

AdmiNRoute.get('/getEditCouponDetails',adminAuth.isLogout,Admincontroll.getEditCouponDetails)

AdmiNRoute.post('/editCoupon',Admincontroll.editCoupon)

AdmiNRoute.get('/chart-data',adminAuth.isLogout,Admincontroll.chart_data)

AdmiNRoute.get('/filter-chart',adminAuth.isLogout,Admincontroll.filter_chart)

AdmiNRoute.get('/loadSalesReport',adminAuth.isLogout,Admincontroll.loadSalesReport)

AdmiNRoute.get('/filter-sales_report',adminAuth.isLogout,Admincontroll.filter_sales_report)

AdmiNRoute.post('/deleteImage',Admincontroll.deleteImage)

module.exports = AdmiNRoute;
