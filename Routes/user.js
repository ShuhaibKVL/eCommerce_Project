const express = require("express")
const UserRoute = express()
const session = require('express-session')
const { v4 :uuidv4} = require('uuid')
const Usercontrol = require("../control/usercontrol")
const UserAuth = require('../Midlleware/UserAuth')
// const nocache = require('nocache')

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






module.exports = UserRoute;

