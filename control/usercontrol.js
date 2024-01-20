const otpGenerator = require("otp-generator")
const OTP = require('../model/OTP')
const ProductModel = require('../model/Product')
const User = require('../model/UserSignup')
const bcrypt =  require('bcrypt')
const AddressSchema = require('../model/Address')
const { default: mongoose } = require("mongoose")



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
        
        const ExsistPassword = isUserLogin.password
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
                            console.log("Error on Otp Creation >> ",error.message)
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
                email :req.body.email.trim(),
                phoneNumber:req.body.phoneNumber,
                password :password,
                })
            
            const userData = await user.save()

            req.session.user_id = user._id;

        
            res.redirect('/')
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

const UserProfile_Loagin = async(req,res) =>{
    try {

        let Profile ;
        if(req.session.user_id){
            Profile = await User.findById({_id:req.session.user_id})
            console.log("Get User id in PROFILE",Profile)
            res.render('UserProfile',{User:Profile})
        }else{
            console.log("No USer")
            
        }
    } catch (error) {
        console.log("Error on UserProfile_Loagin CONTROLL",error.message)
    }
}

const AddressLoad = async(req,res) => {
    try {
        if(req.session.user_id){
            const USERID = req.session.user_id
            const Address = await AddressSchema.find({UserId:USERID})
            console.log("KITTY KITTY ",Address)
            
            res.render('Address',{Address:Address})
        }
        
    } catch (error) {
        console.log("Error on Address Page Loading Controll ",error.message)
    }
}

const Add_AddressLoad = async(req,res) =>{
    try {
        res.render('Add_address')
    } catch (error) {
        console.log("Error on Add_AddressLoad",error.message);
    }
}

const Add_Address = async(req,res) => {
    try {
        if(req.session.user_id){
            const userID = req.session.user_id
            console.log(userID)
        
        const NewAddress = new AddressSchema({
            FirstName : req.body.firstname,
            LastName : req.body.lastname,
            PhoneNumber : req.body.number,
            Email : req.body.email,
            Country : req.body.Country,
            State : req.body.State,
            District :req.body.District,
            add1 : req.body.add1,
            add2 : req.body.add2,
            Town : req.body.city,
            PinCode : req.body.pincode,
            UserId : userID
        })
        
        console.log(NewAddress)
        const addAddress = await NewAddress.save()

        res.redirect('/Address')
        }
    } catch (error) {
        console.log("Error on Add_Address CONTROLL ",error.message)
    }
}

const Edit_AddressLoad = async(req,res) => {
    try {
        if(req.session.user_id){
            const USERID = req.session.user_id
            const Address = await AddressSchema.findOne({UserId:USERID})
            
            res.render('Edit_Address',{Address:Address})
        }
        
    } catch (error) {
        console.log("Error On Edit_AddressLoad ",error.message)
    }
}

const Edit_Address = async(req,res) => {
    try {
        const AddressID = req.body._id
        
        const Edited_Addres = ({
            FirstName : req.body.firstname,
            LastName : req.body.lastname,
            PhoneNumber : req.body.number,
            Email : req.body.email,
            Country : req.body.Country,
            State : req.body.State,
            District :req.body.District,
            add1 : req.body.add1,
            add2 : req.body.add2,
            Town : req.body.city,
            PinCode : req.body.pincode,
            UserId : req.body.UserId
        })
        
        const UpdateAddress = await AddressSchema.findByIdAndUpdate(AddressID, Edited_Addres, { new: true });

        res.redirect('/Address')

    } catch (error) {
        console.log("Error on Edit Product CONTROL ",error.message)
    }
}

const LoadCarts = async(req,res) => {
    try {
        if(!req.session.user_id){
            res.redirect('/Signup')
        }else{
            console.log("dfghjkjhghj");
            const UserID = req.session.user_id
            const CartProducts = await User.findById(UserID).populate('cart.product')
                
                console.log(CartProducts)
                
                res.render('UserCart',{user:CartProducts})
                
        }
    } catch (error) {
        console.log("Error on User Cart",error.message)
    }
}

const UserCart = async(req,res) => {
    try {

        if(!req.session.user_id){
            res.redirect('/Signup')
        }else{
            console.log("dfghjkjhghj");
            const UserID = req.session.user_id
            const CartProducts = await User.findById(UserID).populate('cart.product')
                
                console.log(CartProducts)
                
                res.render('UserCart',{user:CartProducts})
        }

    } catch (error) {
        console.log("Error on Loading UserCart in Controll",error)
    }
}
const AddnewCart = async(req,res) => {
    try {
        if(!req.session.user_id){
            res.redirect('/Signup')
        }else{
            const Product_ID = req.query.id
            const UserID = req.session.user_id
            const user = await User.findById(UserID)
            console.log(Product_ID,UserID)

            let productIndex = user.cart.findIndex(item => item.product._id.toString() === Product_ID);

            // if(productIndex){
            
            // }
            const UpdateUser = await User.findByIdAndUpdate(
                UserID,
                {$push: { cart:{ product:Product_ID, quantity : 1 }}},
                { new :true }
            )
            console.log(UpdateUser);
            res.redirect('/UserCart')
        }
    } catch (error) {
        console.log("Error On Ading CArt",error);
    }
}

// const ObjectId = mongoose.Types.ObjectId;

const remove_from_cart = async(req,res) => {
    try {
        console.log("Invoked Remove Cart Controll");

        const UserID = req.session.user_id
        const ProductId = req.body.productId
        console.log(ProductId)
        const user = await User.findById(UserID)
        
        let productIndex = user.cart.findIndex(item => item.product._id.toString() === ProductId);
        
        await User.updateOne({_id:UserID},{$pull:{cart:user.cart[productIndex]}});
        
        res.redirect('/UserCart')

    } catch (error) {
        console.log("Error On REmove Cart Controll",error)
    }
}


module.exports = {
    Home,
    login,
    isLogin,
    Signup,
    OtpCreation,
    LoadOtp,
    OTpVerification,
    logout,
    ProductDeatils,
    UserProfile_Loagin,
    AddressLoad,
    Add_AddressLoad,
    Add_Address,
    Edit_AddressLoad,
    Edit_Address,
    LoadCarts,
    UserCart,
    AddnewCart,
    remove_from_cart
}