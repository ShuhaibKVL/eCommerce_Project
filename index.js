const mongoose = require('mongoose')
const express = require("express")
const app = express()
const path = require("path")
const multer = require('multer')
const nocache = require('nocache')
app.use(nocache())

// const morgan = require('morgan')
// app.use(morgan('tiny'))s
require('dotenv').config();

const PORT = process.env.PORT || 3000;

mongoose.connect("mongodb+srv://mshuhaibkvl:123@cluster0.q3qp0vj.mongodb.net/");
// mongoose.connect("mongodb://127.0.0.1:27017/")

app.use(express.static(path.join(__dirname,'assets/css')))
app.use("/css",express.static(path.resolve(__dirname,"assets/css")))
app.use("/images",express.static(path.resolve(__dirname,"assets/images")))
app.use("/Js",express.static(path.join(__dirname,"assets/js")))
app.use("/sass",express.static(path.join(__dirname,"assets/sass")))
app.use("/sass",express.static(path.join(__dirname,"assets/cropperjs")))

app.use(express.static(path.join(__dirname,'assets/Admin')))
app.use('/assets',express.static(path.join(__dirname,'assets')))


app.use(express.json())
app.use(express.urlencoded({extended:true}))

    // User Routes
const UserRouter = require("./Routes/user")
app.use('/',UserRouter)

    //  Admin Routes
const AdminRouter = require("./Routes/Admin")
app.use('/Admin',AdminRouter)

app.set('view engine','ejs')
app.set("views","./views/Users")

app.set('view engine','ejs')
app.set("views","./views/Admin")

app.listen(PORT,() =>{
    console.log(`Server is running on http://localhost:${PORT}/`)
    console.log(`Server is running on http://localhost:${PORT}/admin`)
})
