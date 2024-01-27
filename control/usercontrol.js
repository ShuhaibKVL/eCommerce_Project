const otpGenerator = require("otp-generator")
const OTP = require('../model/OTP')
const ProductModel = require('../model/Product')
const User = require('../model/UserSignup')
const OrderModel = require('../model/Order')
const bcrypt =  require('bcrypt')
const AddressSchema = require('../model/Address')
const Otp_Gen_Function =require("../utils/OtpCrater")
const { default: mongoose } = require("mongoose")
const { ObjectId } = require("mongodb")




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
        
        var loginAttempts = req.session.loginAttempts || 0

        req.session.loginAttempts = loginAttempts + 1
        console.log("SWEET ALERT ",loginAttempts);

        setTimeout(() => {
            req.session.loginAttempts = loginAttempts = 0
            console.log("Session AFTER >>>  ",loginAttempts)
        }, 50000);

        if(loginAttempts >= 5){
            res.render('login',{sweet_alert:"Limts Reached"})
        }else{

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
        
        res.render('Signup',{message:"Email All Ready Excist"})
            
    }else if(isExistPas){
            
        res.render('Signup',{message:"INVALID PASSWORD !! ENTER A STRONG PASSWORD"})

    }else if(password == ConfirmPassword){
                    
            try{

                const otpBody = await Otp_Gen_Function(req,res)
                
                console.log("Genorated OTP : ",otpBody)
    
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

   // OTp verification After OTP send to Email

const OTpVerification = async(req,res) =>{
        console.log("I am here")
    try {
        console.log('user:',req.body);
        const { otp, name, email, phoneNumber, hashedPassword} = req.body;
        
        const response = await OTP.find({otp}).sort({createdAt: -1}).limit(1)
        console.log("email response",response)
        if(response.length === 0 || otp !== response[0].otp) {
            console.log("oTp Error")
            return res.render('Otp',{message:"The OTP is not valid",name, email, phoneNumber, hashedPassword})
            
        }else{
            console.log("oTp Find in Mongo")

            const user = new User({
                name :req.body.name,
                email :req.body.email.trim(),
                phoneNumber:req.body.phoneNumber,
                password :req.body.hashedPassword,
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
            const USERID = req.session.user_id
            Profile = await User.findById({_id:USERID})

            const Address = await AddressSchema.find({UserId:USERID})
            console.log("Get User id in PROFILE",Profile)
            // res.render('UserProfile',{User:Profile})
           
            res.render('UserProfile',{User:Profile ,Address:Address})
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

        // res.redirect('/Userprofile')
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
                
            if(!CartProducts) {
                console.log("User Not Found");
            }

            let totalAmount = 0;

            for(const cartItem of CartProducts.cart) {
                totalAmount += cartItem.quantity * cartItem.product.Price
                
            }
            console.log("TOTAL AMOUNT > ",totalAmount);
                
                res.render('UserCart',{user:CartProducts,userId:UserID,Total:totalAmount})

                // res.render('Profile_Test',{user:CartProducts})
                
        }
    } catch (error) {
        console.log("Error on User Cart",error.message)
    }
}

const UserCart = async(req,res) => {
    // try {

    //     if(!req.session.user_id){
    //         res.redirect('/Signup')
    //     }else{
    //         console.log("dfghjkjhghj");
    //         const UserID = req.session.user_id
    //         const CartProducts = await User.findById(UserID).populate('cart.product')
                
    //             console.log(CartProducts)
                
    //             res.render('UserCart',{user:CartProducts})

    //             // Profile_Test
    //             // res.render('Profile_Test',{user:CartProducts})
    //     }

    // } catch (error) {
    //     console.log("Error on Loading UserCart in Controll",error)
    // }
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

            console.log("IS EXISTED THE PRODUCT >> ",productIndex)

            if(productIndex !== -1){
                console.log("CART ALL READY ADDED")

                let result = await User.updateOne({_id:UserID,'cart.product':Product_ID},{$inc:{'cart.$.quantity':1}})

                res.redirect('/Cart')
                
                // res.render('ProductDetails',{cartMSg:"Product quantitu added in cart "})

            }else{
                const UpdateUser = await User.findByIdAndUpdate(
                    UserID,
                    {$push: { cart:{ product:Product_ID, quantity : 1 }}},
                    { new :true }
                )
                console.log(UpdateUser);
                res.redirect('/Cart')
            }
            
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

const update_cart =async(req,res) =>{
    try {
        
        const Quantity = req.query.QA

        console.log('iam qa',Quantity)

        const ProductID = req.query.id;
        const UserID = req.query.pr

        console.log("DATAS FROM CART COUNT >> ",Quantity,UserID , ProductID);
        let userData = await User.findById(UserID)
        console.log(userData)

        let result = await User.updateOne({_id:UserID,'cart.product':ProductID},{$set:{'cart.$.quantity':Quantity}})

        const CartProducts = await User.findById(UserID).populate('cart.product')

        const totalAmount = calculateTotal(CartProducts.cart)
        
        console.log(CartProducts)
        console.log(totalAmount);

        // res.render('UserCart', { user: CartProducts, userId: UserID, totalAmount: totalAmount });
        
        res.json(totalAmount)
    } catch (error) {
        console.log(error.message);
    }

}

// Function to calculate the total amount
const calculateTotal = (cart) => {
    let total = 0;
    cart.forEach((item) => {
        total += item.product.Price * item.quantity;
    });
    return total;
};


const LaodforgoutPassword = (req,res) => {
    try {
        res.render('forgoutPassword')
    } catch (error) {
        console.log("Error On Frogout password Controler",error)
    }
}


const forgoutPassword = async (req,res) => {
    try {
        const email = req.body.email
        console.log(email);

        const otpBody = await Otp_Gen_Function(req,res)
                            
        console.log("Genorated OTP : ",otpBody)

        res.render('Otp_Vald_Forgoutpass',{ Otpmessage:"otp Created susscesFully",Email:email})
    } catch (error) {
        console.log("Error On Frogout password Controler",error)
    }
}

const load_Otp_Vald_Forgoutpass = async(req,res) => {
    try {
        res.render('Otp_Vald_Forgoutpass')
    } catch (error) {
        console.log("Error on laod_Otp_Vald_Forgoutpass CONTROLL",error)
    }
}

const Otp_Vald_Forgoutpass = async(req,res) => {
    try {
        const otp = req.body.otp
        const email = req.body.email
        console.log("Email in Otp-Valid-Forgoutpass",email);

        const response = await OTP.find({otp}).sort({createdAt: -1}).limit(1)
        console.log("email response",response)
        if(response.length === 0 || otp !== response[0].otp) {
            console.log("oTp Error")
            return res.render('Otp_Vald_Forgoutpass',{message:"The OTP is not valid", Email:email})
            
        }else{
            res.render('NewPassword',{Email:email})
        }
    
    } catch (error) {
        console.log("Error ON FRogout password OTP Validation Control",error)
    }
}


const LoadNewPassword = async(req,res) => {
    try {
        res.render('NewPassword')
    } catch (error) {
        console.log("Error on LoadNewPassword Controll",error)
    }
}


const NewPassword = async(req,res) => {
    try {
        console.log("THis is from NewPassword");

        const {password, ConfirmPassword} = req.body
        const email = req.body.email

        console.log("emial in aanewapassword  >>> ",email);

        if(password == ConfirmPassword){
            const user = await User.findOne({email:email})
            console.log(user);

            const hashedPassword = await bcrypt.hash(password ,10)

            user.password = hashedPassword
            await user.save()

            console.log(user);
            res.redirect('/login')
        }
        
        
    } catch (error) {
        console.log("Error on newpassword controll",error);
    }
}

const ResendOTP = async(req,res) => {
    try {
        
        const email =  req.body.email;
        console.log("Email reached RESEND OTP CONTROLL  >> ",email);

        const otpBody = await Otp_Gen_Function(req,res)
                            
        console.log("Genorated OTP : ",otpBody)

    } catch (error) {
        console.log("Error On RESEND OTP CONTROLL",error);
    }
}

const shibili = async(req,res) => {
    try {
        res.render('Profile_Test')
    } catch (error) {
        console.log("HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH");
    }
}

const UpdateProfile = async(req,res) => {
    try {
        
        const userID = req.session.user_id
        if(userID){
            const {username , mobileNumber }  = req.body

            console.log(username , mobileNumber );

            const userData = await User.findById(userID)

            userData.name = username;
            userData.phoneNumber = mobileNumber

            await userData.save()

            console.log(userData);

            console.log("UPDATED SUCCESSFULLY")
            console.log( UpdateProfile);
        }else{
            res.redirect('/')
        }
    
        
    } catch (error) {
        console.log("ERROR ON UPDATE PROFILE",error.message);
    }
}

const LoadChekout = async(req,res) => {
    try {
        if(!req.session.user_id){
            res.redirect('/Signup')
        }else{
            
            const UserID = req.session.user_id
            const CartProducts = await User.findById(UserID).populate('cart.product')
            const Address = await AddressSchema.find({UserId:UserID})
                
            if(!CartProducts) {
                console.log("User Not Found");
            }

            let totalAmount = 0;

            for(const cartItem of CartProducts.cart) {
                totalAmount += cartItem.quantity * cartItem.product.Price
                
            }

            console.log("TOTAL AMOUNT > ",totalAmount);
                
            res.render('Chekout',{user:CartProducts,userId:UserID,Total:totalAmount,Address:Address})
            
        }
        
    } catch (error) {
        console.log("Error on LoadChekout",error);
    }
}

const generateRandomOrderId = () => {
    const randomString = Math.random().toString(10).substring(2, 8);
    return `VAT${randomString}`;
};

const placeOrder = async(req,res) =>{
    try {
        if(!req.session.user_id){
            res.redirect('/')
        }else{
            console.log("Request Reached here ");

            const UserID = req.session.user_id
            const paymentMethod = req.body.paymentMethod
            const addressId = req.body.addressId
    
            const address = await AddressSchema.findById(addressId)
            console.log(address);
    
            
            console.log("AddressID :",addressId,"paymentMethod :",paymentMethod);
            

            const CartProducts = await User.findById(UserID).populate('cart.product')
            console.log("user and cart",CartProducts);
                    
                if(!CartProducts) {
                    console.log("User Not Found");
                }
    
                let totalAmount = 0;
    
                for(const cartItem of CartProducts.cart) {
                    totalAmount += cartItem.quantity * cartItem.product.Price
                    
                }
                console.log("Total Amount : ",totalAmount);
            
            
                const newOrder = new OrderModel({
                    UserId:UserID,
                    OderId:generateRandomOrderId(),
                    totalAmount:totalAmount,
                    Deliver_Address:address,
                    PaymentMethod:paymentMethod,
                    OrderItems:CartProducts.cart.map(item => ({
                        ProductId:item.product._id,
                        quantity:item.quantity,
                        Price:item.product.Price,
                        OrderStatus:"Order Booked"
                    }))
                })
    
                await newOrder.save()
                
                console.log("Order Placed ");
                console.log("Order recorder ");

                res.json(UserID)

        }
    
    } catch (error) {
        console.log("Error on placeOrdr : ",error);
    }
}

const Load_confirmation_Order_page = async(req,res) => {
    try {
        const userId = req.query.id
        console.log("user id reached on server : ",userId);

        const OrderDetails = await OrderModel.findOne({UserId:userId})
        console.log(OrderDetails);

        const order = await OrderModel.findOne({ OderId: orderId }).populate('UserId').exec();

        // res.render('Confirmation_Oder',{OrderDetails:OrderDetails ,UserData:UserData})
        res.render('Confirmation_Oder',{OrderDetails:order})
    } catch (error) {
        console.log(error.message)
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
    remove_from_cart,
    LaodforgoutPassword,
    forgoutPassword,
    load_Otp_Vald_Forgoutpass,
    Otp_Vald_Forgoutpass,
    LoadNewPassword,
    NewPassword,
    ResendOTP,
    shibili,
    update_cart,
    UpdateProfile,
    LoadChekout,
    placeOrder,
    Load_confirmation_Order_page
}