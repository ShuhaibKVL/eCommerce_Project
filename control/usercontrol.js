require('dotenv').config()
const otpGenerator = require("otp-generator")
const OTP = require('../model/OTP')
const ProductModel = require('../model/Product')
const User = require('../model/UserSignup')
const OrderModel = require('../model/Order')
const bcrypt = require('bcrypt')
const AddressSchema = require('../model/Address')
const Otp_Gen_Function = require("../utils/OtpCrater")
const { default: mongoose } = require("mongoose")
const { ObjectId } = require("mongodb")
const couponModel = require('../model/Coupon')
const Razorpay = require('razorpay');
var crypto = require("crypto");
const walletModal = require('../model/wallet')
const { log, error } = require('console')
const moment = require('moment')
const fs = require('fs')
const easyinvoice = require('easyinvoice')
const whishListModel = require('../model/Whishlist')

// Razo Pay
var instance = new Razorpay({ key_id: process.env.YOUR_KEY_ID, key_secret: process.env.YOUR_SECRET })


const login = (req, res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log("Error Occuerde On Login USER CONTROLL >> ", error);
    }

}

const Signup = (req, res) => {
    try {
        res.render('Signup')
    } catch (error) {
        console.log("Error On SIGNUP User Controller >> ", error)
    }

}

const LoadOtp = (req, res) => {
    try {
        res.render('Otp')
    } catch (error) {
        console.log("Error while LOad OTp ejs", error.message)
    }
}

const Home = async (req, res) => {
    try {

        let Profile;
        let whishList;
        if (req.session.user_id) {
            Profile = await User.findById({ _id: req.session.user_id })
            whishList = await whishListModel.findOne({UserId:req.session.user_id})
            console.log("found WhishList >>",whishList);
        }
        const ProductData = await ProductModel.find()
        const MenData = await ProductModel.find({ Category: 'Men' })
        const WomenData = await ProductModel.find({ Category: 'Women' })
        const KidsData = await ProductModel.find({ Category: 'Kids' })

        const flashMessage = req.flash('error');
        console.log("flash Message is : ", flashMessage);

        res.render('home', { whishList,Profile: Profile, Product: ProductData, Men: MenData, Women: WomenData, Kids: KidsData, error: flashMessage })
    } catch (error) {
        console.log("Error on Home Rendering ", error)
    }

}


const SecurePassword = async (password) => {
    try {
        let hashPassword = await bcrypt.hash(password, 10)
        return hashPassword;
    } catch (error) {
        console.log("Error occuered while Password Hashing ", { $SecurePassword }, error)
    }
}


const isLogin = async (req, res) => {
    console.log("INvoked thr isLogin UserController")
    try {

        var loginAttempts = req.session.loginAttempts || 0

        req.session.loginAttempts = loginAttempts + 1
        console.log("SWEET ALERT ", loginAttempts);

        setTimeout(() => {
            req.session.loginAttempts = loginAttempts = 0
            console.log("Session AFTER >>>  ", loginAttempts)
        }, 50000);

        if (loginAttempts >= 5) {
            res.render('login', { sweet_alert: "Limts Reached" })
        } else {

            const Email = req.body.email;
            const password = req.body.password;
            console.log(Email);
            const isUserLogin = await User.findOne({ email: Email })
            console.log(isUserLogin)

            if (isUserLogin) {

                const ExsistPassword = isUserLogin.password
                console.log("Password", ExsistPassword)
                const passwordMatch = await bcrypt.compare(password, ExsistPassword)

                if (passwordMatch) {

                    const isBlocked = isUserLogin.isBlocked

                    if (isBlocked == true) {
                        res.render('login', { message: "BLOCKED  : Admin Blocked You" })
                    } else {
                        req.session.user_id = isUserLogin._id
                        res.redirect('/')
                    }
                } else {
                    res.render('login', { message: "Invalid Password" })

                }

            } else {
                res.render('login', { message: "Invalid Email" })
            }

        }
    } catch (error) {
        console.log("Error occurerd isLogin verification  :  ", error.message)
    }

}


const OtpCreation = async (req, res) => {

    const { name, email, phoneNumber, password, ConfirmPassword } = req.body;

    const isExistUser = await User.findOne({ name: name })
    const IsExistemail = await User.findOne({ email: email })
    const isExistPas = await User.findOne({ password: password })
    if (isExistUser) {

        res.render('Signup', { message: "User All Ready Excist" })

    } else if (IsExistemail) {

        res.render('Signup', { message: "Email All Ready Excist" })

    } else if (isExistPas) {

        res.render('Signup', { message: "INVALID PASSWORD !! ENTER A STRONG PASSWORD" })

    } else if (password == ConfirmPassword) {

        try {

            const otpBody = await Otp_Gen_Function(req, res)

            console.log("Genorated OTP : ", otpBody)

            // Hashed  Password

            const hashedPassword = await SecurePassword(password)

            res.render('Otp', { Otpmessage: "otp Created susscesFully", name: name, email: email, phoneNumber: phoneNumber, hashedPassword: hashedPassword })


        } catch (error) {
            console.log("Error on Otp Creation >> ", error.message)
        }
    } else {
        res.render('Signup', { message: "Password Mismatch..!" })
    }

}

// OTp verification After OTP send to Email

const OTpVerification = async (req, res) => {
    console.log("I am here")
    try {
        console.log('user:', req.body);
        const { otp, name, email, phoneNumber, hashedPassword } = req.body;
        console.log(otp);

        const response = await OTP.find({ otp }).sort({ createdAt: -1 }).limit(1)
        console.log("email response", response)
        if (response.length === 0 || otp !== response[0].otp) {
            console.log("oTp Error")

            return res.json({ success: true })

        } else {
            console.log("oTp Find in Mongo")
            console.log(hashedPassword);
            const user = new User({
                name: req.body.name,
                email: req.body.email.trim(),
                phoneNumber: req.body.phoneNumber,
                password: req.body.hashedPassword,
            })
            console.log(user)
            const userData = await user.save()

            req.session.user_id = user._id;


            // res.redirect('/')
            res.json({ redirectUrl: '/' })
        }
    } catch (error) {
        console.log("Error occuered While OTp VERIFIcation . THe Error IS >>>", error.message)
    }
}

const logout = async (req, res) => {
    try {

        req.session.user_id = null;

        res.redirect('/')
    } catch (error) {
        console.log(error.message)
    }
}

const ProductDeatils = async (req, res) => {
    try {
        const Product_ID = req.query.id
        console.log(Product_ID);

        const FindProduct = await ProductModel.findById(Product_ID)
        console.log(FindProduct);
        res.render('ProductDetails', { Product: FindProduct })
    } catch (error) {
        console.log("Error on ProductDetails Controller", error.message)
    }
}

const UserProfile_Loagin = async (req, res) => {
    try {

        let Profile;
        if (req.session.user_id) {
            const USERID = req.session.user_id
            Profile = await User.findById({ _id: USERID })

            const Address = await AddressSchema.find({ UserId: USERID })
            console.log("Get User id in PROFILE", Profile)
            // res.render('UserProfile',{User:Profile})

            res.render('UserProfile', { User: Profile, Address: Address })
        } else {
            console.log("No USer")

        }
    } catch (error) {
        console.log("Error on UserProfile_Loagin CONTROLL", error.message)
    }
}

const AddressLoad = async (req, res) => {
    try {
        if (req.session.user_id) {
            const USERID = req.session.user_id
            const Address = await AddressSchema.find({ UserId: USERID })
            console.log("KITTY KITTY ", Address)

            res.render('Address', { Address: Address })
        }

    } catch (error) {
        console.log("Error on Address Page Loading Controll ", error.message)
    }
}

const Add_AddressLoad = async (req, res) => {
    try {
        if (req.session.user_id) {
            res.render('Add_address')
        } else {
            res.redirect('/Signup')
        }

    } catch (error) {
        console.log("Error on Add_AddressLoad", error.message);
    }
}

const Add_Address = async (req, res) => {
    try {
        console.log("Reached on Add_Address");
        if (req.session.user_id) {
            const userID = req.session.user_id
            console.log("UserId : ", userID)

            const NewAddress = new AddressSchema({
                FirstName: req.body.firstname,
                LastName: req.body.lastname,
                PhoneNumber: req.body.number,
                Email: req.body.email,
                Country: req.body.Country,
                State: req.body.State,
                District: req.body.District,
                add1: req.body.add1,
                add2: req.body.add2,
                Town: req.body.city,
                PinCode: req.body.pincode,
                UserId: userID
            })

            console.log(NewAddress)
            const addAddress = await NewAddress.save()
            console.log(addAddress);

            const fromCheckout = req.body.fromCheckout

            if (fromCheckout) {
                res.redirect('/Chekout')
            } else {
                res.redirect('/Userprofile')
            }


        } else {
            res.redirect('/')
        }
    } catch (error) {
        console.log("Error on Add_Address CONTROLL ", error.message)
    }
}

const Edit_AddressLoad = async (req, res) => {
    try {
        if (req.session.user_id) {
            const addressId = req.query.id
            const isfrom = req.query.from
            console.log(isfrom);
            console.log(addressId);

            const Address = await AddressSchema.findOne({ _id: addressId })

            res.render('Edit_Address', { Address: Address, from: isfrom })
        } else {
            res.redirect('/login')
        }

    } catch (error) {
        console.log("Error On Edit_AddressLoad ", error.message)
    }
}

const Edit_Address = async (req, res) => {
    try {
        const AddressID = req.body._id
        const from = req.body.isfrom
        console.log("This is from post edit address controller : ", from);

        const Edited_Addres = ({
            FirstName: req.body.firstname,
            LastName: req.body.lastname,
            PhoneNumber: req.body.number,
            Email: req.body.email,
            Country: req.body.Country,
            State: req.body.State,
            District: req.body.District,
            add1: req.body.add1,
            add2: req.body.add2,
            Town: req.body.city,
            PinCode: req.body.pincode,
            UserId: req.body.UserId
        })

        const UpdateAddress = await AddressSchema.findByIdAndUpdate(AddressID, Edited_Addres, { new: true });

        if (from === "checkout") {
            res.redirect('/Chekout')
        } else {
            res.redirect('/UserProfile')
        }



    } catch (error) {
        console.log("Error on Edit Product CONTROL ", error.message)
    }
}

const DeleteAddress = async (req, res) => {
    try {
        console.log("reached on delete  controll");
        const addressId = req.query.id
        console.log(addressId)
        const deleteAddress = await AddressSchema.deleteOne({ _id: addressId })

        const msg = 'Susess'

        res.json(msg)
    } catch (error) {
        console.log("Error on Delete Address Controll", error);
    }
}

const LoadCarts = async (req, res) => {
    try {
        if (!req.session.user_id) {
            res.redirect('/Signup')
        } else {

            const UserID = req.session.user_id
            const CartProducts = await User.findById(UserID).populate('cart.product')
            console.log("CartProducts :",CartProducts);

            if (!CartProducts) {
                console.log("User Not Found");
            }

            let totalAmount = 0;

            for (const cartItem of CartProducts.cart) {
                if(!cartItem.product.isList){
                    totalAmount += cartItem.quantity * cartItem.product.Price
                }
                
            }
            
            console.log("TOTAL AMOUNT > ", totalAmount);

            res.render('UserCart', { user: CartProducts, userId: UserID, Total: totalAmount })

        }
    } catch (error) {
        console.log("Error on User Cart", error)
    }
}


const AddnewCart = async (req, res) => {
    try {
        if (!req.session.user_id) {
            res.redirect('/Signup')
        } else {
            const isFromBynow = req.query.isFromByNow
            const Product_ID = req.query.id
            const UserID = req.session.user_id
            const user = await User.findById(UserID)
            console.log(Product_ID, UserID, isFromBynow)

            let productIndex = user.cart.findIndex(item => item.product._id.toString() === Product_ID);

            console.log("IS EXISTED THE PRODUCT >> ", productIndex)

            if (productIndex !== -1) {
                console.log("CART ALL READY ADDED")

                let result = await User.updateOne({ _id: UserID, 'cart.product': Product_ID }, { $inc: { 'cart.$.quantity': 1 } })

                if (isFromBynow) {
                    res.redirect('/Chekout')
                } else {
                    res.redirect('/Cart')
                }

                // res.render('ProductDetails',{cartMSg:"Product quantitu added in cart "})

            } else {
                const UpdateUser = await User.findByIdAndUpdate(
                    UserID,
                    { $push: { cart: { product: Product_ID, quantity: 1 } } },
                    { new: true }
                )
                console.log(UpdateUser);
                // res.redirect('/Cart')

                if (isFromBynow) {
                    res.redirect('/Chekout')
                } else {
                    res.redirect('/Cart')
                }
            }

        }
    } catch (error) {
        console.log("Error On Ading CArt", error);
    }
}



const remove_from_cart = async (req, res) => {
    try {
        console.log("Invoked Remove Cart Controll");

        const UserID = req.session.user_id
        const ProductId = req.body.productId
        console.log(ProductId)
        const user = await User.findById(UserID)

        let productIndex = user.cart.findIndex(item => item.product._id.toString() === ProductId);

        await User.updateOne({ _id: UserID }, { $pull: { cart: user.cart[productIndex] } });

        res.redirect('/Cart')

    } catch (error) {
        console.log("Error On REmove Cart Controll", error)
    }
}

const update_cart = async (req, res) => {
    try {

        const Quantity = req.query.QA

        console.log('iam qa', Quantity)

        const ProductID = req.query.id;
        const UserID = req.query.pr

        console.log("DATAS FROM CART COUNT >> ", Quantity, UserID, ProductID);
        let userData = await User.findById(UserID)
        console.log(userData)

        let result = await User.updateOne({ _id: UserID, 'cart.product': ProductID }, { $set: { 'cart.$.quantity': Quantity } })

        const CartProducts = await User.findById(UserID).populate('cart.product')

        const totalAmount = calculateTotal(CartProducts.cart)

        console.log(CartProducts)
        console.log(totalAmount);

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


const LaodforgoutPassword = (req, res) => {
    try {
        res.render('forgoutPassword')
    } catch (error) {
        console.log("Error On Frogout password Controler", error)
    }
}


const forgoutPassword = async (req, res) => {
    try {
        const email = req.body.email
        console.log(email);

        const otpBody = await Otp_Gen_Function(req, res)

        console.log("Genorated OTP : ", otpBody)

        res.render('Otp_Vald_Forgoutpass', { Otpmessage: "otp Created susscesFully", Email: email })
    } catch (error) {
        console.log("Error On Frogout password Controler", error)
    }
}

const load_Otp_Vald_Forgoutpass = async (req, res) => {
    try {
        res.render('Otp_Vald_Forgoutpass')
    } catch (error) {
        console.log("Error on laod_Otp_Vald_Forgoutpass CONTROLL", error)
    }
}

const Otp_Vald_Forgoutpass = async (req, res) => {
    try {
        const otp = req.body.otp
        const email = req.body.email
        console.log("Email in Otp-Valid-Forgoutpass", email);

        const response = await OTP.find({ otp }).sort({ createdAt: -1 }).limit(1)
        console.log("email response", response)
        if (response.length === 0 || otp !== response[0].otp) {
            console.log("oTp Error")
            return res.render('Otp_Vald_Forgoutpass', { message: "The OTP is not valid", Email: email })

        } else {
            res.render('NewPassword', { Email: email })
        }

    } catch (error) {
        console.log("Error ON FRogout password OTP Validation Control", error)
    }
}


const LoadNewPassword = async (req, res) => {
    try {
        res.render('NewPassword')
    } catch (error) {
        console.log("Error on LoadNewPassword Controll", error)
    }
}


const NewPassword = async (req, res) => {
    try {
        console.log("THis is from NewPassword");

        const { password, ConfirmPassword } = req.body
        const email = req.body.email

        console.log("emial in aanewapassword  >>> ", email);

        if (password == ConfirmPassword) {
            const user = await User.findOne({ email: email })
            console.log(user);

            const hashedPassword = await bcrypt.hash(password, 10)

            user.password = hashedPassword
            await user.save()

            console.log(user);
            res.redirect('/login')
        }


    } catch (error) {
        console.log("Error on newpassword controll", error);
    }
}

const ResendOTP = async (req, res) => {
    try {

        const email = req.body.email;
        console.log("Email reached RESEND OTP CONTROLL  >> ", email);

        const otpBody = await Otp_Gen_Function(req, res)

        console.log("Genorated OTP : ", otpBody)

    } catch (error) {
        console.log("Error On RESEND OTP CONTROLL", error);
    }
}


const UpdateProfile = async (req, res) => {
    try {

        const userID = req.session.user_id
        if (userID) {
            const { username, mobileNumber } = req.body

            console.log(username, mobileNumber);

            const userData = await User.findById(userID)

            userData.name = username;
            userData.phoneNumber = mobileNumber

            await userData.save()

            console.log(userData);

            console.log("UPDATED SUCCESSFULLY")

            res.redirect('/UserProfile')
        } else {
            res.redirect('/')
        }


    } catch (error) {
        console.log("ERROR ON UPDATE PROFILE", error.message);
    }
}

const LoadChekout = async (req, res) => {
    try {
        if (!req.session.user_id) {
            res.redirect('/Signup')
        } else {

            const UserID = req.session.user_id
            const CartProducts = await User.findById(UserID).populate('cart.product')
            const Address = await AddressSchema.find({ UserId: UserID })
            // console.log(UserID);
            // console.log(CartProducts);
            console.log("Address is : ", Address);


            if (!CartProducts) {
                console.log("User Not Found");
            }

            let totalAmount = 0;

            for (const cartItem of CartProducts.cart) {
                if(!cartItem.product.isList){
                    totalAmount += cartItem.quantity * cartItem.product.Price
                }
                

            }

            let deliveryCharge = 0;
            if (totalAmount < 500) {
                totalAmount += 100
                deliveryCharge = 100;
            }

            res.render('Chekout', { user: CartProducts, userId: UserID, Total: totalAmount, Address: Address, deliveryCharge: deliveryCharge })

        }

    } catch (error) {
        console.log("Error on LoadChekout", error);
    }
}

const loadCouponDetails = async (req, res) => {
    try {
        const coupons = await couponModel.find()

        if (coupons) {
            res.json(coupons)
        } else {
            res.status(404).json({ error: 'Coupon not found' })
        }

    } catch (error) {
        console.log("Error On loadCouponDetails Controller : ", error);
    }
}

const useCoupon = async (req, res) => {
    try {
        const couponId = req.query.id
        const totalAmount = req.query.total

        const couponDetails = await couponModel.findOne({ couponCode: couponId })
        console.log(couponDetails);
        const discountAmount = couponDetails.discount;
        const discountType = couponDetails.discountType;
        const expireDate = couponDetails.expireDate;
        const liveTime = new Date()

        const isUsed = await couponModel.findOne({ couponCode: couponId, userId: req.session.user_id })
        console.log("Status of Checking is Coupon used > ", isUsed);

        if (expireDate < liveTime) {
            return res.status(200).json({ isExpired: true })
        }
        else if (isUsed) {
            console.log("The coupon used once ..!");
            return res.status(200).json({ isUse: true })
        } else {

            req.session.couponId = couponId

            var totalAmountAfterDeduction = 0;

            if (discountType == "fixed") {
                totalAmountAfterDeduction = totalAmount - discountAmount;
                console.log(totalAmountAfterDeduction);
                return res.status(200).json({ totalAmountAfterDeduction, couponDetails })
            } else {
                const discount = -1*(totalAmount / 100 * discountAmount)
                totalAmountAfterDeduction = totalAmount - discount
                return res.status(200).json({ totalAmountAfterDeduction, couponDetails ,discount})
            }

        }

    } catch (error) {
        console.log("Error on useCoupon COntroller : ", error);
    }
}


const direct_buy = async (req, res) => {
    try {

    } catch (error) {
        console.log("ERROR on direct_buy Controller");
    }
}


const generateRandomOrderId = () => {
    const randomString = Math.random().toString(10).substring(2, 8);
    return `VAT${randomString}`;
};

const placeOrder = async (req, res) => {
    try {
        if (!req.session.user_id) {
            res.redirect('/')
        } else {
            console.log("Request Reached here ");

            const UserID = req.session.user_id
            const paymentMethod = req.body.paymentMethod
            const addressId = req.body.addressId
            const Total = req.body.Total.trim()
            const couponId = req.session.couponId
            
            if(couponId){
                const insertUserId = await couponModel.updateOne({ couponCode: couponId }, { $push: { userId: req.session.user_id } })
                console.log("coupon :> ",insertUserId);
            }
            
            const OderId = generateRandomOrderId()

            const address = await AddressSchema.findById(addressId)
            console.log(address);

            const CartProducts = await User.findById(UserID).populate('cart.product')

            if (!CartProducts) {
                console.log("User Not Found");
            }
            if (paymentMethod == 'RazorPay') {

                const newOrder = new OrderModel({
                    UserId: UserID,
                    OderId: OderId,
                    totalAmount: Total,
                    Deliver_Address: address,
                    PaymentMethod: paymentMethod,
                    OrderItems: CartProducts.cart.map(item => ({
                        ProductId: item.product._id,
                        quantity: item.quantity,
                        Price: item.product.Price,

                    }))
                })

                var options = {
                    amount: Total * 100,  // amount in the smallest currency unit
                    currency: "INR",
                    receipt: "" + OderId
                };
                instance.orders.create(options, function (err, order) {
                    console.log(order);
                    res.json({ status: "Razorpay", order: order, newOrder: newOrder })
                });
                

            } else if (paymentMethod == 'COD') {

                const newOrder = new OrderModel({
                    UserId: UserID,
                    OderId: OderId,
                    totalAmount: Total,
                    Deliver_Address: address,
                    PaymentMethod: paymentMethod,
                    OrderItems: CartProducts.cart.map(item => ({
                        ProductId: item.product._id,
                        quantity: item.quantity,
                        Price: item.product.Price,

                    }))
                })

                await newOrder.save()

                const user = await User.findById(UserID)

                // Inventory Managment
                for (const cartItem of CartProducts.cart) {

                    let incValue = Number(cartItem.quantity);

                    let dowQuantity = await ProductModel.updateOne({ _id: cartItem.product._id }, { $inc: { Stock: -incValue } })

                }

                if (user) {
                    await user.clearCart();
                }

                res.json({ status: "COD", orderId: OderId })

            } else if (paymentMethod == 'Wallet') {
                const wallet = await walletModal.findOne({ userId: UserID })

                if(wallet.balance < parseInt(Total)){
                    return res.json({ status: "not balance", balance: wallet.balance })
                }else{

                const newOrder = new OrderModel({
                    UserId: UserID,
                    OderId: OderId,
                    totalAmount: Total,
                    Deliver_Address: address,
                    PaymentMethod: paymentMethod,
                    OrderItems: CartProducts.cart.map(item => ({
                        ProductId: item.product._id,
                        quantity: item.quantity,
                        Price: item.product.Price,

                    }))
                })

                await newOrder.save()

                const user = await User.findById(UserID)

                // Inventory Managment
                for (const cartItem of CartProducts.cart) {

                    let incValue = Number(cartItem.quantity);

                    let dowQuantity = await ProductModel.updateOne({ _id: cartItem.product._id }, { $inc: { Stock: -incValue } })

                }

                if (user) {
                    await user.clearCart();
                }

                const currentDate = moment()
                const formattedDate = currentDate.format('YYYY-MM-DD')

                const updateWallet = await walletModal.findOneAndUpdate(
                    { userId: UserID },
                    {
                        $inc: { balance: -Total },
                        $push: {
                            history: {
                                date: formattedDate,
                                description: 'Purchased With wallet',
                                transaction: 'Debit',
                                amount: Total
                            },
                        },
                    },
                    { new: true }
                )
                res.json({ status: "Wallet", orderId: OderId })
            }
            }
        }

    } catch (error) {
        console.log("Error on placeOrdr : ", error);
    }
}


const verifyRazorpayPayment = async (req, res) => {

    console.log("verify payment reached on server", req.body);
    const details = req.body
    const orderData = req.body.newOrder
    const OderId = orderData.OderId
    console.log("Oder Id = ", OderId);

    // if success , save the order details
    const newOrderInstance = await new OrderModel(orderData)
    newOrderInstance.PaymentId = details.response.razorpay_payment_id

    await newOrderInstance.save()

    const user = await User.findById(req.session.user_id)
    const CartProducts = await User.findById(req.session.user_id).populate('cart.product')

    // Inventory Managment
    console.log("The products oder >> ", CartProducts.cart)
    for (const cartItem of CartProducts.cart) {
        let incValue = Number(cartItem.quantity)
        let dowQuantity = await ProductModel.updateOne({ _id: cartItem.product._id }, { $inc: { Stock: -incValue } })
    }

    if (user) {
        await user.clearCart();
    }

    // Your secret key from the environment variable
    const secretKey = process.env.YOUR_KEY_ID
    // Creating an HMAC with SHA-256
    const hmac = crypto.createHmac("sha256", secretKey);
    // Updating the HMAC with the data
    hmac.update(
        details.response.razorpay_order_id +
        "|" +
        details.response.razorpay_payment_id
    );
    // Getting the hexadecimal representation of the HMAC
    const hmacFormat = hmac.digest("hex");
    console.log("hmacFormat : ", hmacFormat);
    console.log("razo_pay_signature :", req.body.response.razorpay_signature);

    var response = { "signatureIsValid": "false" }

    res.json({ status: "RazorPay", orderId: OderId })

};



const Load_confirmation_Order_page = async (req, res) => {
    try {
        const OderId = req.query.id
        console.log("user id reached on server : ", OderId);

        const order = await OrderModel.findOne({ OderId: OderId }).populate('UserId').populate('OrderItems.ProductId').exec();

        res.render('Confirmation_Oder', { OrderDetails: order });

        console.log("Load_Confirmation page Successfully ");
    } catch (error) {
        console.log("Error on Loading Confirmation Page", error.message)
    }
}

const LoadOrderManagment = async (req, res) => {
    const page = req.query.page || 1;
    const limit = 9;
    const skip = (page - 1) * limit;
    try {
        if (!req.session.user_id) {
            res.redirect('/Signup')
        } else {

            const totalUsers = await OrderModel.countDocuments();
            const totalPages = Math.ceil(totalUsers / limit);

            const userID = req.session.user_id
            const order = await OrderModel.find({ UserId: userID }).sort({ Orderdate: -1 }).skip(skip).limit(limit)
            const Products = await OrderModel.find({ UserId: userID }).populate(['OrderItems.ProductId']).sort({ Orderdate: -1 }).skip(skip).limit(limit)

            res.render('OrderManagment', { Order: order, product: Products, totalPages: totalPages })
        }

    } catch (error) {
        console.log("Error on load order managment controll : > ", error.message)
    }
}

const cancel_Order = async (req, res) => {
    try {
        console.log("Server reached on cancel_controller ");
        const productId = req.query.id
        const OderId = req.query.OderId
        const UserId = req.query.UserId
        console.log(productId, OderId, UserId);

        const cancel = 'Request: cancel Order'

        const updateStatus = await OrderModel.updateOne({ OderId: OderId, 'OrderItems.ProductId': productId }, { $set: { 'OrderItems.$.OrderStatus': cancel } })

        res.json({ success: true })

    } catch (error) {
        console.log("Error on Order Canceling Controller > ", error);
    }
}

const ReturnOrder = async (req, res) => {
    try {
        console.log("Server reached on cancel_controller ");
        const productId = req.query.id
        const OderId = req.query.OderId
        const UserId = req.query.UserId
        console.log(productId, OderId, UserId);

        const Return = 'Request: Return Order'

        const updateStatus = await OrderModel.updateOne({ OderId: OderId, 'OrderItems.ProductId': productId }, { $set: { 'OrderItems.$.OrderStatus': Return } })

        res.json({ success: true })
    } catch (error) {
        console.log("ERROR ON RETURN ORDER CONTROLL");
    }
}

const orderDetails = async (req, res) => {
    try {
        const oderId = req.query.id
        const allOrder = await OrderModel.find()
        for(const orders of allOrder){
            const allDelivered = orders.OrderItems.every(item => item.OrderStatus === 'Delivered')
            if(allDelivered){
                orders.OrderStatus = "Delivered"
                await orders.save()
            }
        }

        const order = await OrderModel.findById(oderId).populate('UserId').populate('OrderItems.ProductId').exec();
        console.log("The oder details got : - ", order);

        res.render('OrderDetails', { OrderDetails: order })
    } catch (error) {
        console.log("Error on orderDetails CONTROLLER :", error);
    }
}

const download_invoice = async (req, res) => {
    try {
        const oderId = req.query.oderId
        console.log("oderid:",oderId);
        if (!oderId) {
            res.status(400).send("Order ID not provided")
            return
        } else {
            console.log(oderId);
            const order = await OrderModel.findOne({OderId:oderId}).populate({ path: 'UserId', model: 'User' }).populate({ path: 'OrderItems.ProductId' })
            console.log("the datas :> ",order.UserId.name,order.Deliver_Address.add1,order.Deliver_Address.PinCode,order.Deliver_Address.Country);

            // Prepare invoice data
            const invoiceData = {
                currency: 'USD',
                taxNotation: 'vat',
                marginTop: 25,
                marginRight: 25,
                marginLeft: 25,
                marginBottom: 25,
                logo: '/assets/images/Group 7.png', // Replace with your company logo URL
                sender: {
                    company: 'veloxAttire LTD',
                    address: 'TP8 7 , Online Sales.th floor,Phase 4 ,Cyber Park , Bangalor ',
                    zip: '147893',
                    city: 'Bangaloor',
                    country: 'India'
                },
                client: {
                    name: order.UserId.name,
                    address: order.Deliver_Address.add1,
                    zip: order.Deliver_Address.PinCode,
                    city: order.Deliver_Address.Town,
                    country: order.Deliver_Address.Country
                },
                invoiceNumber: '2024.0001'+order.OderId,
                invoiceDate: new Date().toISOString().split('T')[0], // Current date
                products: []
            };

            const products = order.OrderItems.map(item => ({
                quantity: item.quantity,
                description: item.ProductId.Name,
                "tax-rate": 0,
                price: item.Price
            }));

            invoiceData.products.push(...products);
            console.log(invoiceData);
            
            // Generate invoice PDF using Easy Invoice
            easyinvoice.createInvoice(invoiceData, function (result) {
                if (result.error) { // Change 'error' to 'result.error'
                    console.error("Error generating invoice : ", result.error);
                    res.status(500).send('Error generating invoice');
                } else {
                    // Save invoice PDF to file
                    res.setHeader('Content-Type', 'application/pdf');
                    res.setHeader('Content-Disposition', 'attachment; filename="invoice.pdf"');
                    res.send(Buffer.from(result.pdf, 'base64'));
                }
            });

        }
    } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).send('Error generating invoice');
    }
}


const loadSalesReport = async (req, res) => {
    try {
        const order = await OrderModel.find().populate('OrderItems.ProductId')
        // const Products = await OrderModel.find({ UserId: userID }).populate(['OrderItems.ProductId'])
        res.render('invoice', { order })
    } catch (error) {
        console.log(error);
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
    DeleteAddress,
    LoadCarts,
    AddnewCart,
    remove_from_cart,
    LaodforgoutPassword,
    forgoutPassword,
    load_Otp_Vald_Forgoutpass,
    Otp_Vald_Forgoutpass,
    LoadNewPassword,
    NewPassword,
    ResendOTP,
    update_cart,
    UpdateProfile,
    LoadChekout,
    loadCouponDetails,
    useCoupon,
    direct_buy,
    placeOrder,
    Load_confirmation_Order_page,
    LoadOrderManagment,
    cancel_Order,
    ReturnOrder,
    verifyRazorpayPayment,
    orderDetails,
    download_invoice,
    loadSalesReport
}