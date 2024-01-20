const express = require("express")
const UserRoute = express()
const session = require('express-session')
const { v4 :uuidv4} = require('uuid')
const Usercontrol = require("../control/usercontrol")
const UserAuth = require('../Midlleware/UserAuth')
// const nocache = require('nocache')
// UserRoute.use(nocache())

UserRoute.use(session({secret:uuidv4(),resave:false,saveUninitialized:false}))

UserRoute.set("view engine","ejs")
UserRoute.set('views','./views/Users')


UserRoute.get('/',UserAuth.IsBlocked ,Usercontrol.Home)

UserRoute.get('/login',UserAuth.isLogout,Usercontrol.login)

UserRoute.post('/login',Usercontrol.isLogin)

UserRoute.get('/Signup',UserAuth.isLogout,Usercontrol.Signup)

UserRoute.post('/Signup',Usercontrol.OtpCreation)

UserRoute.get('/Otp',Usercontrol.LoadOtp)

UserRoute.post('/Otp',Usercontrol.OTpVerification)

UserRoute.get('/logout',Usercontrol.logout)

UserRoute.get('/ProductDetails',Usercontrol.ProductDeatils)

UserRoute.get('/UserProfile',Usercontrol.UserProfile_Loagin)

UserRoute.get('/Address',Usercontrol.AddressLoad)

UserRoute.get('/Add_Address',Usercontrol.Add_AddressLoad)

UserRoute.post('/Add_Address',Usercontrol.Add_Address)

UserRoute.get('/Edit_Address',Usercontrol.Edit_AddressLoad)

UserRoute.post('/Edit_Address',Usercontrol.Edit_Address)

UserRoute.get('/Cart',Usercontrol.LoadCarts)

UserRoute.get('/UserCart',Usercontrol.UserCart)

UserRoute.get('/AddToCart',Usercontrol.AddnewCart)

UserRoute.post('/remove-from-cart',Usercontrol.remove_from_cart)







module.exports = UserRoute;

