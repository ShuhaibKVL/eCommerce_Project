require('dotenv').config()
const { find, updateOne, findByIdAndUpdate } = require('../model/OTP')
const User = require('../model/UserSignup')
const ProductSchema = require("../model/Product")
const { unlink } = require('../Routes/user')
const Category = require('../model/Category')
const OrderModel = require('../model/Order')
const couponModel = require('../model/Coupon')
const walletModel = require('../model/wallet')
const moment = require('moment')
const sharp = require('sharp')


const DashBoard =async (req, res) => {
    try {
        const orders = await OrderModel.find()
        const totalOrders = orders.length
        const users = await User.countDocuments()
        const product = await ProductSchema.countDocuments()
        const totalRevenue = orders.reduce((acc,order) => {
            return acc + parseFloat(order.totalAmount)
        },0)

        //Best selling Product
        let productSales = {}
        orders.forEach(orders => {
            orders.OrderItems.forEach(item => {
                const productId = item.ProductId.toString();
                if(!productSales[productId]){
                    productSales[productId] = {
                        quantity: 0,
                        revenue: 0
                    }
                }
                productSales[productId].quantity += item.quantity;
                productSales[productId].revenue += item.quantity * item.Price
            })
        })


        let sortedProductsByQuantity = Object.keys(productSales).map(productId => ({
            productId,
            quantity: productSales[productId].quantity,
            revenue: productSales[productId].revenue
        }));

        sortedProductsByQuantity.sort((a, b) => b.quantity - a.quantity);

        // Get the top 10 best-selling products
        const topSellingProductsIdByQuantity = sortedProductsByQuantity.slice(0, 10);

        // Sort products by revenue
        let sortedProductsByRevenue = Object.keys(productSales).map(productId => ({
            productId,
            quantity: productSales[productId].quantity,
            revenue: productSales[productId].revenue
        }));
        sortedProductsByRevenue.sort((a, b) => b.revenue - a.revenue);
        const topSellingProductsByRevenue = sortedProductsByRevenue.slice(0, 10);

        // Get product details for top selling products
        const topSellingProductIds = [...new Set([...topSellingProductsIdByQuantity.map(product => product.productId), ...topSellingProductsByRevenue.map(product => product.productId)])];
        const topSellingProducts = await ProductSchema.find({ _id: { $in: topSellingProductIds } });
        console.log("topSellingProducts : ",topSellingProducts);
    
        res.render('DashBoard',{totalOrders,users,product,totalRevenue,topSellingProducts})
    } catch (error) {
        console.log('Error Occuerd on DashBoard Controller',error)
    }
}

const Login = async (req, res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(error)
    }
}

const loginValidation = async (req, res) => {
    const Admin = process.env.Admin
    const Password = process.env.Password
    try {
        if (Admin == req.body.name && Password == req.body.password) {
            req.session.admin_id = req.body.name
            res.redirect('/admin/DashBoard')
        } else {
            res.render('login', { message: "invalid Authentication" })
        }
    } catch (error) {
        console.log(error)
    }
}

const adminLogout = async (req, res) => {
    try {
        req.session.admin_id = null
        res.redirect('/admin')
    } catch (error) {
        console.log("Error on adminLogout CONTROLLER ", error);
    }
}

const userDetails = async (req, res) => {
    const isHave = req.query.page
    const page = req.query.page || 1;
    const limit = 9;
    const skip = (page - 1) * limit;
    try {
        const totalUsers = await User.countDocuments();
        const totalPages = Math.ceil(totalUsers / limit);
        const userDatas = await User.find().skip(skip).limit(limit)
          // Dynamically response on First render page and according to PAgination
        if(isHave){
            res.json({ users: userDatas, totalPages: totalPages, currentPage: page ,skip:skip});
        }
        else{
            res.render('UserDetails', { users: userDatas , totalPages: totalPages})
        }
    } catch (error) {
        console.log(error.message)
    }
}


const blockUser = async (req, res) => {
    try {
        const userId = req.query.id;

        const user = await User.findById(userId)

        let update_isBlock;
        if (user.isBlocked) {

            update_isBlock = await User.findByIdAndUpdate(userId, { $set: { isBlocked: false } }, { new: false })
            res.redirect('UserDetails')

        } else {

            update_isBlock = await User.findByIdAndUpdate({ _id: userId }, { $set: { isBlocked: true } }, { new: true })

            res.redirect('UserDetails')

        }

    } catch (error) {
        console.log("Error Occuered on blockUser Admin Route", error)
    }
}


const Product = async (req, res) => {
    try {
        const ProductData = await ProductSchema.find()
        const CategoryData = await Category.find()

        res.render('Product', { Product: ProductData, Category: CategoryData })
    } catch (error) {
        console.log("Error on Product controll")
    }
}

const Load_Add_Product = async (req, res) => {
    try {
        const CategoryData = await Category.find()
        res.render('Add_Product', { Category: CategoryData })

    } catch (error) {
        console.log("Error ON Load_Add_Product")
    }

}

const Add_Product = async (req, res, next) => {

    try {
        const Name = req.body.name
        const Description = req.body.description
        
        if (Name.length > 14) {
            return res.redirect('Product')
        } else if (Description.length > 14) {

            return res.redirect('Product')
        } else {

            const newProduct = new ProductSchema({
                Name: req.body.name,
                Price: req.body.price,
                Category: req.body.category,
                Size: req.body.size,
                Stock: req.body.stock,
                Description: req.body.description,
                Image: req.files.map((file) => file.filename)

            })
            console.log("the product to add :",newProduct);
            await newProduct.save()
            console.log("after save : ",newProduct);

            res.redirect('Product')
        }

    } catch (error) {
        console.log("Error Occuerd  in Addproduct Controller :", error)
    }
}


const DeletProduct = async (req, res) => {
    try {
        console.log("Route reached in DeleteProduct");

        const Product_Id = req.query.id
        console.log(Product_Id)
        const product = await ProductSchema.findById(Product_Id)
        console.log(product);
        console.log("<>",product.isList);
        let update_isList;
        if(product.isList){
            console.log("AAAAAAAAA");
            update_isList = await ProductSchema.findByIdAndUpdate(Product_Id,{ $set: {isList: false}}, {new:false})
        }else{
            console.log("BBBBBBBBBB");
            update_isList = await ProductSchema.findByIdAndUpdate(Product_Id,{ $set: {isList: true}}, {new:true})
        }

        console.log(">>>>",update_isList);
        // const Delete = await ProductSchema.deleteOne({ _id: Product_Id })

        res.redirect('Product')

    } catch (error) {
        console.log("Error on Admin DeleteProduct", error)
    }
}

const LoadEditProduct = async (req, res) => {
    try {
        const Product_Id = req.query.id
        console.log(Product_Id);
        const ProductData = await ProductSchema.findById({ _id: Product_Id })
        const CategoryData = await Category.find()
        console.log(ProductData);
        res.render('EditProduct', { Product: ProductData, Category: CategoryData })
    } catch (error) {
        console.log("Error occuered on LoadEditProduct", error)
    }
}


const EditProduct = async (req, res) => {
    console.log("Edit Product Invoked");
    try{
    const Product_ID = req.body.id;
    let Image = req.files.map((file) => file.filename)
    const existImages = req.body.existImage
    const existImagesArray = existImages.split(',');

    
    if(existImagesArray.length === 4){
        
        console.log(existImagesArray);
        
        const ProductDataToUpdate = {
            Name: req.body.name,
            Price: req.body.price,
            Category: req.body.category,
            Size: req.body.size,
            Stock: req.body.stock,
            Description: req.body.description,
            Image: existImagesArray
        };
        const updateProduct = await ProductSchema.findByIdAndUpdate(Product_ID, ProductDataToUpdate, { new: true });
    }else{
        const ProductDataToUpdate = {
            Name: req.body.name,
            Price: req.body.price,
            Category: req.body.category,
            Size: req.body.size,
            Stock: req.body.stock,
            Description: req.body.description,
            Image: req.files.map((file) => file.filename)
        };
        if (req.files) {
            ProductDataToUpdate.Image = req.files.map((file) => file.filename)
        }
        const updateProduct = await ProductSchema.findByIdAndUpdate(Product_ID, ProductDataToUpdate, { new: true });
        console.log("Form Edit Product :",updateProduct,ProductDataToUpdate);
    }
    
    
    res.redirect('Product');
    } catch (error) {
        console.log("Error Occurred on EDITPRODUCT", error);
    }
};

const LoadCategory = async (req, res) => {
    try {
        res.render('Category')
    } catch (error) {
        console.log("Error on Catogory controll : >>", error)
    }
}

const CreateCategory = async (req, res) => {
    try {
        InputCategory = req.body.name
        isExict = await Category.findOne({ Name: InputCategory })
        if (isExict) {
            res.render('Category', { message: "Category All ready Exict" })
        } else {
            const NewCategory = new Category({
                Name: req.body.name,
                Description: req.body.description
            })
            const NewCategoryCreate = await NewCategory.save()
            res.redirect('Product')
        }

    } catch (error) {
        console.log("Error On CreaateCategory  : >>", error)
    }
}

const DeletCategory = async (req, res) => {
    try {
        const CategoryID = req.query.id
        const DeleteCategory = await Category.deleteOne({ _id: CategoryID })
        res.redirect('/Product')
    } catch (error) {
        console.log("Error ON DeleteCategory", error)
    }
}

const UnlistCategory = async (req, res) => {
    try {
        const CategoryID = req.query.id
        const CategoryData = await Category.findById(CategoryID)

        let UpdateCategory;
        if (CategoryData.IsList) {
            UpdateCategory = await Category.findByIdAndUpdate(CategoryID, { $set: { IsList: false } }, { new: false })
            console.log("Invoked False >> ", UpdateCategory);
            res.redirect('Product')
        } else {
            UpdateCategory = await Category.findByIdAndUpdate(CategoryID, { $set: { IsList: true } }, { new: true })
            console.log("Invoked True >> ", UpdateCategory);
            res.redirect('Product')
        }

    } catch (error) {
        console.log("ERROR ON UnlistCategory", error)
    }
}

// Order Management

const OrderManagment = async (req, res) => {
    const isHave = req.query.page
    const page = req.query.page || 1;
    const limit = 9;
    const skip = (page - 1) * limit;
    try {
        const totalUsers = await OrderModel.countDocuments();
        const totalPages = Math.ceil(totalUsers / limit);

        const order = await OrderModel.find().populate({ path: 'UserId', model: 'User' }).populate({ path: 'OrderItems.ProductId' }).sort({ Orderdate: -1 }).skip(skip).limit(limit).exec();
        const Products = await OrderModel.find().populate(['OrderItems.ProductId']).sort({ Orderdate: -1 }).skip(skip).limit(limit).exec();

        res.render('AdminOrderManagment', { Order: order, product: Products, totalPages: totalPages ,page:page})
        
    } catch (error) {
        console.log(error.message)
    }
}

const RefreshOrderManagement = async (req, res) => {
    try {
        const userID = req.session.user_id
        const order = await OrderModel.find().populate({ path: 'OrderItems.ProductId' }).exec();
        console.log("Order find on  ADMIN DB >> ", order);
        res.render('AdminOrderManagment', { Order: order })
    } catch (error) {
        console.log("ERROR ON REFRESH ORDER MANAGEMENT CONTROLL");
    }
}

const Approve_cancel_order = async (req, res) => {
    try {
        console.log("Server reached on Approve_cancel_order controller ");
        const productId = req.query.id
        const OderId = req.query.OderId
        const UserId = req.query.UserId
        const CurrentPage = req.query.page

        const ApproveCancel = 'Canceled'

        const updateStatus = await OrderModel.updateOne({ OderId: OderId, 'OrderItems.ProductId': productId }, { $set: { 'OrderItems.$.OrderStatus': ApproveCancel } })

        const order = await OrderModel.findOne({ OderId: OderId, 'OrderItems.ProductId': productId }).populate('OrderItems.ProductId');
        const product = order.OrderItems.find(item => item.ProductId._id.toString() === productId)
        console.log(product);
                // INVENTORY
                const updatedStock = product.ProductId.Stock + product.quantity;
                await ProductSchema.findByIdAndUpdate(product.ProductId._id, { Stock: updatedStock });

        if (order.PaymentMethod !== "COD") {
            console.log("Order is :", order);

            // wallet update
            const currentDate = moment()
            const formattedDate = currentDate.format('YYYY-MM-DD')

            const userWallet = await walletModel.findOne({ userId: UserId })
            if (userWallet) {
                const newHistory = {
                    date: formattedDate,
                    description: "Canceled order",
                    transaction: "Credit",
                    amount: product.Price * product.quantity
                }

                userWallet.balance += product.Price * product.quantity,
                    console.log("newHistory :", newHistory);

                userWallet.history.push(newHistory)
                userWallet.save()
            }
            else {
                const newWallet = new walletModel({
                    userId: UserId,
                    balance: product.Price * product.quantity,
                    history: [{
                        date: formattedDate,
                        description: "Canceled order",
                        transaction: "Credit",
                        amount: product.Price * product.quantity
                    }]
                })
                newWallet.save()
            }

        }
        
        res.json({updateStatus:updateStatus,CurrentPage:CurrentPage})

    } catch (error) {
        console.log("Error on Approve_cancel_order CONTROLL :", error);
    }
}

const Delivered = async (req, res) => {
    try {
        console.log("Server reached on Approve_cancel_order controller ");
        const productId = req.query.id
        const OderId = req.query.OderId
        const UserId = req.query.UserId
        const CurrentPage = req.query.page
        console.log(productId, OderId, UserId);

        const Delivered = 'Delivered'

        const updateStatus = await OrderModel.updateOne({ OderId: OderId, 'OrderItems.ProductId': productId }, { $set: { 'OrderItems.$.OrderStatus': Delivered } })

        // res.json({success:true})
        res.json({updateStatus:updateStatus,CurrentPage:CurrentPage})

    } catch (error) {
        console.log("ERROR ON DELIVERED CONTROLLER");
    }
}

const Order_Return = async (req, res) => {
    try {
        
        const productId = req.query.id
        const OderId = req.query.OderId
        const UserId = req.query.UserId
        const CurrentPage = req.query.page

        const Delivered = 'Returned'

        const updateStatus = await OrderModel.updateOne({ OderId: OderId, 'OrderItems.ProductId': productId }, { $set: { 'OrderItems.$.OrderStatus': Delivered } })

        // wallet update
        const currentDate = moment()
        const formattedDate = currentDate.format('YYYY-MM-DD')
        const order = await OrderModel.findOne({ OderId: OderId, 'OrderItems.ProductId': productId }).populate('OrderItems.ProductId');
        const product = order.OrderItems.find(item => item.ProductId._id.toString() === productId)
        const userWallet = await walletModel.findOne({ userId: UserId })

        if (userWallet) {
            const newHistory = {
                date: formattedDate,
                description: "Return product",
                transaction: "Credit",
                amount: product.Price * product.quantity
            }

            userWallet.balance += product.Price * product.quantity,
                console.log("newHistory :", newHistory);

            userWallet.history.push(newHistory)
            await userWallet.save()
        }
        else {
            const newWallet = new walletModel({
                userId: UserId,
                balance: product.Price * product.quantity,
                history: [{
                    date: formattedDate,
                    description: "Return product",
                    transaction: "Credit",
                    amount: product.Price * product.quantity
                }]
            })
            await newWallet.save()
        }

        // INVENTORY
        const updatedStock = product.ProductId.Stock + product.quantity;
        await ProductSchema.findByIdAndUpdate(product.ProductId._id, { Stock: updatedStock });

        res.json({updateStatus:updateStatus,CurrentPage:CurrentPage})

    } catch (error) {
        console.log("Error On Order_Return CONTROLLER",error.message);
    }
}

const orderDetails = async (req, res) => {
    try {
        const oderId = req.query.id
        // const orderDetails = await OrderModel.findById(oderId).populate(['OrderItems.ProductId'])
        const order = await OrderModel.findById(oderId).populate('UserId').populate('OrderItems.ProductId').exec();
        console.log("The oder details got : - ", order);

        res.render('orderDeiatils', { OrderDetails: order })
    } catch (error) {
        console.log("Error on orderDetails CONTROLLER :", error);
    }
}

const loadCoupon = async (req, res) => {
    try {

        const coupon = await couponModel.find()

        res.render('addCoupon', { coupon: coupon })

    } catch (error) {
        console.log("Error on loadCoupon Controller : ", error.message);
    }
}


// Coupon Cod creation
function generateCouponCode(length) {
    const capitalLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let couponCode = '';

    // Generate the first 4 characters (capital letters)
    for (let i = 0; i < 4; i++) {
        couponCode += capitalLetters.charAt(Math.floor(Math.random() * capitalLetters.length));
    }

    // Generate the remaining characters (numeric digits)
    for (let i = 4; i < length; i++) {
        couponCode += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }

    return couponCode;
}


const addNewCoupon = async (req, res) => {
    try {
        const uniqueCouponCode = generateCouponCode(8);

        const newCoupon = new couponModel({
            name: req.body.name,
            couponCode: uniqueCouponCode,
            discountType: req.body.discountType,
            discount: req.body.discount,
            instruction: req.body.instruction,
            expireDate: req.body.expireDate
        })
        await newCoupon.save()
        res.redirect('/admin/loadCoupon')

    } catch (error) {
        console.log("Error on addNewCoupon Controller : ", error.message);
    }
}

const DeleteCoupon = async (req, res) => {
    try {
        couponId = req.query.id
        const deleteCoupon = await couponModel.deleteOne({ _id: couponId })
        res.json("success")
    } catch (error) {
        console.log("Error on DeleteCoupon Controller : ", error.message);
    }
}

const getEditCouponDetails = async (req, res) => {
    try {
        const couponId = req.query.id
        const couponDetails = await couponModel.findById(couponId)
        if (couponDetails) {
            res.json(couponDetails)
        } else {
            res.status(404).json({ error: 'Coupon not found' })
        }
    } catch (error) {
        console.log("Error on getEditCouponDetails Controller : ", error);
        res.status(500).json({ error: 'Internal server error' })
    }
}

const editCoupon = async (req, res) => {
    try {
        const couponId = req.body._id

        const couponUpdateData = {
            name: req.body.editname,
            couponCode: req.body.editCoupenCode,
            discountType: req.body.editdiscountType,
            discount: req.body.editdiscount,
            instruction: req.body.editinstruction,
            expireDate: req.body.editExpireDate
        }
        console.log(couponUpdateData)

        const updatecoupon = await couponModel.findByIdAndUpdate(couponId, couponUpdateData, { new: true });
        console.log(updatecoupon);

        res.redirect('/admin/loadCoupon')

    } catch (error) {
        console.log("Error on editCoupon controller :", error);
    }
}

//   CHART DATA

const chart_data = async(req,res) =>{
    try {
        const orders = await OrderModel.find().populate('OrderItems.ProductId').exec();
        const category = await Category.find()
        const categoryCounts = {}
        category.forEach(category =>{
            categoryCounts[category.Name] = 0
        })

        orders.forEach(item => {
            item.OrderItems.forEach(element => {
                const categoryName =element.ProductId.Category
                if(categoryCounts.hasOwnProperty(categoryName)){
                    categoryCounts[categoryName]++
                }
            });
        })

        const categoryLabels = Object.keys(categoryCounts)
        const categoryData = Object.values(categoryCounts)
        
        // aggregate orders by DAY
        const ordersByDay = orders.reduce((acc,order) => {
            const date = order.createdAt.toISOString().split('T')[0]// Extract date in YYYY-MM-DD format
            if(!acc[date]){
                acc[date] = {
                    totalAmount :0,
                    orderCount : 0
                }
            }
            acc[date].totalAmount += parseFloat(order.totalAmount)
            acc[date].orderCount++;
            return acc
        },{})

        console.log("ordersByDay",ordersByDay);

        const labels = Object.keys(ordersByDay)
        const data = Object.values(ordersByDay)

        //Best sale category
        const bestCategory = orders.map(data => {
            
        })

        res.json({labels,data,categoryLabels,categoryData})

    } catch (error) {
        console.log("Error on chart-data Controller :",error);
    }
}


const filter_chart = async(req,res) => {
    try {
        const filterQuery = req.query.timeChart
        console.log(filterQuery);

        const orders = await OrderModel.find()

        if(filterQuery == "week"){
             // Aggregate order data by week
        const ordersByWeek = orders.reduce((acc, order) => {
            const weekStart = order.createdAt;
            weekStart.setHours(0, 0, 0, 0);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Set to Sunday of the current week
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 7); // Add 7 days to get next Sunday

            const weekKey = `${weekStart.toISOString().split('T')[0]} - ${weekEnd.toISOString().split('T')[0]}`;
            if (!acc[weekKey]) {
                acc[weekKey] = {
                    totalAmount: 0,
                    orderCount: 0
                };
            }
            acc[weekKey].totalAmount += parseFloat(order.totalAmount);
            acc[weekKey].orderCount++;
            return acc;
        }, {});

        // Convert aggregated data into arrays for labels, total amount, and order count
        const labels = Object.keys(ordersByWeek);
        const data = Object.values(ordersByWeek);

        res.json({labels, data})

        }else if(filterQuery == 'month'){

            const ordersByMonth = orders.reduce((acc, order) => {
                const orderDate = order.createdAt;
                const yearMonthKey = `${orderDate.getFullYear()}-${(orderDate.getMonth() + 1).toString().padStart(2, '0')}`;
            
                if (!acc[yearMonthKey]) {
                    acc[yearMonthKey] = {
                        totalAmount: 0,
                        orderCount: 0
                    };
                }
            
                acc[yearMonthKey].totalAmount += parseFloat(order.totalAmount);
                acc[yearMonthKey].orderCount++;
            
                return acc;
            }, {});
            
            const labels = Object.keys(ordersByMonth);
            const data = Object.values(ordersByMonth);
            
            res.json({labels, data})
        }else if(filterQuery == 'day'){
            // aggregate orders by DAY
        const ordersByDay = orders.reduce((acc,order) => {
            const date = order.createdAt.toISOString().split('T')[0]
            if(!acc[date]){
                acc[date] = {
                    totalAmount :0,
                    orderCount : 0
                }
            }

            acc[date].totalAmount += parseFloat(order.totalAmount)
            acc[date].orderCount++;
            return acc
        },{})

        const labels = Object.keys(ordersByDay)
        const data = Object.values(ordersByDay)

        res.json({labels,data})
        }
    } catch (error) {
        console.log("Error on filter-chart controller :",error);
    }
}

//--------------------------------------------------------------------------------//

const loadSalesReport =async(req,res) => {
    const page = req.query.page || 1;
    const limit = 9;
    const skip = (page - 1) * limit;
    try {
        const order = await OrderModel.find()
        const totalOrders = order.length
        for(const orders of order){
            const allDelivered = orders.OrderItems.every(item => item.OrderStatus === 'Delivered')
            if(allDelivered){
                orders.OrderStatus = "Delivered"
                await orders.save()
            }
        }

        const totalUsers = await OrderModel.find({OrderStatus : "Delivered"}).countDocuments()
        const totalPages = Math.ceil(totalUsers / limit);

        // const Orders = await OrderModel.find({OrderStatus : "Delivered"}).populate({ path: 'UserId', model: 'User' }).populate({ path: 'OrderItems.ProductId' })
        const Orders = await OrderModel.find({OrderStatus : "Delivered"}).populate({ path: 'UserId', model: 'User' }).populate({ path: 'OrderItems.ProductId',model:'Product' })
        Orders.forEach(element => {
            element.OrderItems.forEach(item => {
                let name =item.ProductId
                let Price = item.ProductId
            })
        })
        const startDate = order[0].createdAt
        const endDate = order[order.length-1].createdAt

        const totalRevenue = Orders.reduce((acc,order) => {
            return acc + parseFloat(order.totalAmount)
        },0)


        
        res.render('salesReport',{order:Orders,totalPages,page,startDate,endDate,totalRevenue,totalOrders,totalUsers})
    } catch (error) {
        console.log("Error on loadSalesReport controller : ",error);
    }
}

const filter_sales_report = async(req,res) => {
    try {
        const startDateString = req.query.sDate
        const endDateString = req.query.eDate
        console.log("Dates : ",startDateString,endDateString);

        const startDate = new Date(startDateString)
        const endDate = new Date(endDateString)

        const order = await OrderModel.find()

        for(const orders of order){
            const allDelivered = orders.OrderItems.every(item => item.OrderStatus === 'Delivered')
            if(allDelivered){
                orders.OrderStatus = "Delivered"
                await orders.save()
            }
        }
        
        const Orders = await OrderModel.find({OrderStatus : "Delivered" , createdAt:{ $gte:startDate , $lte:endDate}}).populate({ path: 'UserId', model: 'User' }).populate({ path: 'OrderItems.ProductId' })
        
        const totalRevenue = Orders.reduce((acc,order) => {
            return acc + parseFloat(order.totalAmount)
        },0)
        const fromDate = startDate.toLocaleDateString()
        const toDate = endDate.toLocaleDateString()

        res.json({Orders,fromDate,toDate,totalRevenue})

    } catch (error) {
        console.log("Error on filter_sales_report Controller :",error);
    }
}

const deleteImage = async(req,res) => {
    try {
        const productId = req.body.productId
        const index = req.body.index
        console.log("<<<>>>>",productId,index);

        const product = await ProductSchema.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.Image.splice(index, 1);

        await product.save();

        const Product = await ProductSchema.findById(productId)
        const imageLatestUpdate = [...Product.Image]
        console.log("imageLatestUpdate  :",imageLatestUpdate);

        console.log('Image deleted successfully');
        res.status(200).json({ message: 'Image deleted successfully',productId,imageLatestUpdate });

    } catch (error) {
        console.log("ERROR ON deleteImage controller :",error);
    }
}


module.exports = {
    DashBoard,
    Login,
    loginValidation,
    userDetails,
    blockUser,
    Product,
    Load_Add_Product,
    Add_Product,
    DeletProduct,
    LoadEditProduct,
    EditProduct,
    LoadCategory,
    CreateCategory,
    DeletCategory,
    UnlistCategory,
    OrderManagment,
    RefreshOrderManagement,
    Approve_cancel_order,
    Delivered,
    orderDetails,
    Order_Return,
    loadCoupon,
    addNewCoupon,
    DeleteCoupon,
    getEditCouponDetails,
    editCoupon,
    adminLogout,
    chart_data,
    filter_chart,
    loadSalesReport,
    filter_sales_report,
    deleteImage
}