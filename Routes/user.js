const express = require("express")
const UserRoute = express()
const session = require('express-session')
const { v4 :uuidv4} = require('uuid')
const Usercontrol = require("../control/usercontrol")
const UserAuth = require('../Midlleware/UserAuth')
const Whishlist = require("../model/Whishlist")
const WhishlistController = require('../control/whishListController')
const filterProductController = require('../control/filterProductController')
const walletController = require('../control/walletController')
const flash = require('connect-flash')
const nocache = require('nocache')
const Razorpay = require('razorpay')


UserRoute.use(session({secret:uuidv4(),resave:false,saveUninitialized:false}))

UserRoute.set("view engine","ejs")
UserRoute.set('views','./views/Users')

UserRoute.use(session({
    secret: process.env.SESSION_SC,
    resave: false,
    saveUninitialized: true
}))

UserRoute.use(flash())

UserRoute.get('/',nocache(),Usercontrol.Home)

UserRoute.get('/login',nocache(),UserAuth.isLogout,Usercontrol.login)

UserRoute.post('/login',Usercontrol.isLogin)

UserRoute.get('/Signup',nocache(),UserAuth.isLogout,Usercontrol.Signup)

UserRoute.post('/Signup',Usercontrol.OtpCreation)

UserRoute.get('/Otp',nocache(),Usercontrol.LoadOtp)

UserRoute.post('/Otp',Usercontrol.OTpVerification)

UserRoute.get('/logout',Usercontrol.logout)

UserRoute.get('/ProductDetails',UserAuth.IsBlocked,Usercontrol.ProductDeatils)

UserRoute.get('/UserProfile',UserAuth.isLogin,UserAuth.IsBlocked,Usercontrol.UserProfile_Loagin)

UserRoute.get('/Address',UserAuth.isLogin,UserAuth.IsBlocked,Usercontrol.AddressLoad)

UserRoute.get('/Add_Address',UserAuth.isLogin,UserAuth.IsBlocked,Usercontrol.Add_AddressLoad)

UserRoute.post('/Add_Address',UserAuth.isLogin,UserAuth.IsBlocked,Usercontrol.Add_Address)

UserRoute.delete('/DeleteAddress',UserAuth.IsBlocked,Usercontrol.DeleteAddress)

UserRoute.get('/Edit_Address',UserAuth.isLogin,UserAuth.IsBlocked,Usercontrol.Edit_AddressLoad)

UserRoute.post('/Edit_Address',UserAuth.isLogin,UserAuth.IsBlocked,Usercontrol.Edit_Address)

UserRoute.get('/Cart',UserAuth.isLogin,UserAuth.IsBlocked,Usercontrol.LoadCarts)

UserRoute.get('/AddToCart',UserAuth.isLogin,UserAuth.IsBlocked,Usercontrol.AddnewCart)

UserRoute.post('/remove-from-cart',UserAuth.isLogin,UserAuth.IsBlocked,Usercontrol.remove_from_cart)

UserRoute.get('/forgoutPassword',UserAuth.IsBlocked,Usercontrol.LaodforgoutPassword)

UserRoute.post('/forgoutPassword',UserAuth.IsBlocked,Usercontrol.forgoutPassword)

UserRoute.get('/Otp_Vald_Forgoutpass',UserAuth.IsBlocked,Usercontrol.load_Otp_Vald_Forgoutpass)

UserRoute.post('/Otp_Vald_Forgoutpass',UserAuth.IsBlocked,Usercontrol.Otp_Vald_Forgoutpass)

UserRoute.get('/NewPassword',UserAuth.IsBlocked,Usercontrol.LoadNewPassword)

UserRoute.post('/NewPassword',UserAuth.IsBlocked,Usercontrol.NewPassword)

UserRoute.post('/ResendOtp',UserAuth.IsBlocked,Usercontrol.ResendOTP)

UserRoute.get('/update-cart',UserAuth.isLogin,UserAuth.IsBlocked,Usercontrol.update_cart)

UserRoute.post('/UpdateProfile',UserAuth.isLogin,Usercontrol.UpdateProfile)

UserRoute.get('/Chekout',UserAuth.isLogin,UserAuth.IsBlocked,Usercontrol.LoadChekout)

UserRoute.get('/loadCouponDetails',UserAuth.isLogin,UserAuth.IsBlocked,Usercontrol.loadCouponDetails)

UserRoute.get('/useCoupon',UserAuth.isLogin,UserAuth.IsBlocked,Usercontrol.useCoupon)

UserRoute.get('/direct_buy',UserAuth.isLogin,UserAuth.IsBlocked,Usercontrol.direct_buy)

UserRoute.post('/checkout_add_address',UserAuth.isLogin,UserAuth.IsBlocked,Usercontrol.Add_Address)

UserRoute.post('/placeOrder',UserAuth.isLogin,UserAuth.IsBlocked,Usercontrol.placeOrder)

UserRoute.post("/verifyPayment",UserAuth.isLogin,UserAuth.IsBlocked,Usercontrol.verifyRazorpayPayment)

UserRoute.get('/confirmation_Order_page',UserAuth.isLogin,Usercontrol.Load_confirmation_Order_page)

UserRoute.get('/LoadOrderManagment',UserAuth.isLogin,UserAuth.IsBlocked,Usercontrol.LoadOrderManagment)

UserRoute.patch('/cancelOrder',UserAuth.isLogin,UserAuth.IsBlocked,Usercontrol.cancel_Order)

UserRoute.patch('/ReturnOrder',UserAuth.isLogin,UserAuth.IsBlocked,Usercontrol.ReturnOrder)

UserRoute.get('/orderDetails',UserAuth.isLogin,UserAuth.IsBlocked,Usercontrol.orderDetails)

UserRoute.get('/addToWhishList',UserAuth.isLogin,UserAuth.IsBlocked,WhishlistController.addToWhishList)

UserRoute.get('/loadWhishList',UserAuth.isLogin,UserAuth.IsBlocked,WhishlistController.loadWhishList)

UserRoute.post('/remove-from-whishlist',UserAuth.isLogin,UserAuth.IsBlocked,WhishlistController.remove_from_whish_list)

UserRoute.post('/searchFromNavbar',UserAuth.IsBlocked,filterProductController.redirectTOloadFilterPage)

UserRoute.get('/loadSearchProduct',UserAuth.IsBlocked,filterProductController.LoadfilterProduct)

UserRoute.get('/searchInput',UserAuth.IsBlocked,filterProductController.searchInput)

UserRoute.post('/filterProducts',UserAuth.IsBlocked,filterProductController.filterProducts)

    // wallet

UserRoute.get('/LoadWallet',UserAuth.isLogin,UserAuth.IsBlocked,walletController.LoadWallet)

   // INvoice download
UserRoute.get('/download-invoice',UserAuth.isLogin,UserAuth.IsBlocked,Usercontrol.download_invoice)

// UserRoute.get('/loadSalesReport',Usercontrol.loadSalesReport)



UserRoute.get('/Prd',(req,res) => {
    res.render('PrD')
})



UserRoute.get('/test',(req,res) => {
        res.render('test')
})








module.exports = UserRoute;

