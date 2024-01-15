const otpGenerator = require("otp-generator")
const OTP = require('../model/OTP')
const ProductModel = require('../model/Product')
const User = require('../model/UserSignup')
const bcrypt =  require('bcrypt')



const login =  (req,res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log("Error Occuerde On Login USER CONTROLL >> ",error);
    }
    
}

const Signup = (req,res) => {
    try {
        res.render('Signup')
    } catch (error) {
        console.log("Error On SIGNUP User Controller >> ",error)
    }
    
}

const LoadOtp = (req,res) => {
    try {
        res.render('Otp')
    } catch (error) {
        console.log("Error while LOad OTp ejs",error.message)
    }
}

const Home = async(req,res) =>{
    try {

        let Profile ;
        if(req.session.user_id){
            Profile = await User.findById({_id:req.session.user_id})
        }
        const ProductData = await ProductModel.find()
        const MenData = await ProductModel.find({Category:'Men'})
        const WomenData = await ProductModel.find({Category:'Women'})
        const KidsData = await ProductModel.find({Category:'Kids'})

        res.render('home',{Profile:Profile, Product:ProductData, Men:MenData, Women:WomenData, Kids: KidsData})
    } catch (error) {
        console.log("Error on Home Rendering ",error)
    }
    
}


const SecurePassword =  async(password) =>{
    try {
        let hashPassword = await bcrypt.hash(password,10)
        return hashPassword;
    } catch (error) {
        console.log("Error occuered while Password Hashing ",{$SecurePassword},error)
    }
}


const isLogin = async(req,res) =>{
    console.log("INvoked thr isLogin UserController")
    try {
        
    const Email = req.body.email;
    const password = req.body.password;
    console.log(Email);
    const isUserLogin = await User.findOne({email:Email})
    console.log(isUserLogin)
    
    if(isUserLogin){
        
        const userData = await User.findOne({email:Email})
        console.log("userData : >> ",userData)

        const ExsistPassword = userData.password
        console.log("Password",ExsistPassword)
        const passwordMatch = await bcrypt.compare(password,ExsistPassword)
        
        if(passwordMatch){

            const isBlocked = isUserLogin.isBlocked
        
            if(isBlocked == true){
                res.render('login',{message:"BLOCKED  : Admin Blocked You"})
            }else{
                req.session.user_id = isUserLogin._id
                res.redirect('/')
            }
        }else{
            res.render('login',{message:"Invalid Password"})
        }
        
    }else{
        res.render('login',{message:"Invalid Email"})
    }
    
    } catch (error) {
        console.log("Error occurerd isLogin verification  :  ",error.message)
    }
    
}


const OtpCreation =async (req,res) =>{
    
    const { name, email, phoneNumber, password, ConfirmPassword} = req.body;

    const isExistUser = await User.findOne({name:name})
    const IsExistemail = await User.findOne({email:email})
    const isExistPas =await User.findOne({password:password})
    if(isExistUser){

        res.render('Signup',{message:"User All Ready Excist"})
        
    }else if(IsExistemail){
        
        // res.render('Signup',{message:"Email All Ready Excist"})
            
    }else if(isExistPas){
            
        res.render('Signup',{message:"INVALID PASSWORD !! ENTER A STRONG PASSWORD"})

    }else{
                    if(req.body.password === ConfirmPassword){
                        try{
                            
                             // Otp creation Section
                            
                            let otp = otpGenerator.generate(6, {
                                upperCaseAlphabets: false,
                                lowerCaseAlphabets: false,
                                specialChars: false,
                            });

                            let result = await OTP.findOne({ otp: otp });
                            
                            while (result) {
                                otp = otpGenerator.generate(6, {
                                upperCaseAlphabets: false,
                                });
                                result = await OTP.findOne({ otp: otp });
                            }

                            console.log("here 3")
                            const email = req.body.email
                            console.log(email)
                            const otpPayload = { email , otp }
                            console.log("here 4")
                            const otpBody = await OTP.create(otpPayload)

                            console.log(otpBody)

                            // Hashed  Password

                            const hashedPassword = await SecurePassword(password)

                            res.render('Otp',{ Otpmessage:"otp Created susscesFully",name:name,email:email, phoneNumber:phoneNumber,hashedPassword:hashedPassword})
                            
                            
                        }catch(error){
                            console.log(error.message)
                        }
                    }else{
                        res.render('Signup',{message:"Password Mismatch..!"})
                    }
                }
}

   // OTp verification After OTP send to Email

const OTpVerification = async(req,res) =>{
        console.log("I am here")
    try {
        console.log('user:',req.body);
        const { otp, name, email, phoneNumber, password} = req.body;
        
        const response = await OTP.find({otp}).sort({createdAt: -1}).limit(1)
        console.log("email response",response)
        if(response.length === 0 || otp !== response[0].otp) {
            console.log("oTp Error")
            return res.render('Otp',{message:"The OTP is not valid",name, email, phoneNumber, password, ConfirmPassword})
            
        }else{
            console.log("oTp Find in Mongo")

            // const hashedPassword = await SecurePassword(req.body.password)
            const user = new User({
                name :req.body.name,
                email :req.body.email,
                phoneNumber:req.body.phoneNumber,
                password :password,
                })
            
            const userData = await user.save()

            req.session.user_id = user._id;

            res.render('home',{Profile:user})
        }
    } catch (error) {
        console.log("Error occuered While OTp VERIFIcation . THe Error IS >>>",error.message)
    }
}

const logout = async(req,res) => {
    try {
        req.session.user_id = null;
        res.redirect('/')
    } catch (error) {
        console.log(error.message)
    }
}

const ProductDeatils = async(req,res) => {
    try {
        const Product_ID = req.query.id
        
        const FindProduct = await ProductModel.findById(Product_ID)
        console.log(FindProduct);
        res.render('ProductDetails',{Product:FindProduct})
    } catch (error) {
        console.log("Error on ProductDetails Controller",error.message)
    }
}



module.exports = {
    Home,
    login,
    isLogin,
    Signup,
    //LoadAhome,
    OtpCreation,
    LoadOtp,
    OTpVerification,
    logout,
    ProductDeatils
}