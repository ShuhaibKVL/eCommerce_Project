require('dotenv').config()
const { find, updateOne, findByIdAndUpdate } = require('../model/OTP')
const User = require('../model/UserSignup')
const ProductSchema = require("../model/Product")
const { unlink } = require('../Routes/user')
const Category = require('../model/Category')


const DashBoard = (req,res) => {
    try {
        res.render('DashBoard')
    } catch (error) {
        console.log('Error Occuerd on DashBoard Controller')
    }
}
const Login = async (req,res) =>{
    try {
        res.render('login')
    } catch (error) {
        console.log(error)
    }

}

const isLogin = async (req,res) =>{
    const Admin = process.env.Admin
    const Password = process.env.Password
    try {
        if(Admin == req.body.name && Password == req.body.password){
            res.render('DashBoard')
        }else{
            res.render('login',{message:"invalid Authentication"})
        }
    } catch (error) {
        console.log(error)
    }
}

const userDetails = async(req,res) =>{
    
    const userDatas = await User.find()
    try {
        console.log("i am here")
        res.render('UserDetails',{users:userDatas})
    } catch (error) {
        console.log(error.message)
    }
}
const blockUser = async(req, res) => {
    try {
        const  userId = req.query.id;

        const user = await User.findById(userId)
        console.log("User is >> ",user)
        
        let update_isBlock ;
        console.log(user.isBlocked)
        if(user.isBlocked){
            console.log("if block")

            update_isBlock = await User.findByIdAndUpdate(userId , {$set:{isBlocked:false}}, { new: false})

            console.log('update:',update_isBlock);
            
            res.redirect('UserDetails')
        
        }else{
            console.log("else block")
            
            update_isBlock = await User.findByIdAndUpdate({_id:userId},{$set:{isBlocked:true}}, {new: true})

            console.log('update:',update_isBlock);
            
            res.redirect('UserDetails')
            
        }
        // res.json({ isBlocked: updateIsBlocked.isBlocked });

    } catch (error) {
        console.log("Error Occuered on blockUser Admin Route",error)
    }
    
}


const Product = async(req,res) =>{
    try {
        console.log("Product Controll invoked")
        const ProductData = await ProductSchema.find()
        const CategoryData = await Category .find()
        // console.log(CategoryData)
        // console.log(typeof ProductData)
        // console.log(ProductData)
        res.render('Product',{Product:ProductData,Category:CategoryData})
    } catch (error){
        console.log("Error on Product controll")
    }
}

const Load_Add_Product = async(req,res) =>{
    try {
        const CategoryData = await Category.find()
        console.log(CategoryData);
        res.render('Add_Product',{Category:CategoryData})

    } catch (error) {
        console.log("Error ON Load_Add_Product")
    }
    
}

const Add_Product = async (req,res,next) => {
    
    try {
        const Name = req.body.name
        const Description = req.body.description
        if(Name.length > 14 ){
            res.render('Product',{message:"Name should not excseed more than 14 words"})
        }else if(Description.length > 14){
            res.render('Product',{message:"Descriptin should not excseed more than 14 words"})
        }else{
            const croppedImageData = req.body.croppedImageData
        
            const newProduct = new ProductSchema({
                Name : req.body.name,
                Price : req.body.price,
                Category : req.body.category,
                Size : req.body.size,
                Stock : req.body.stock,
                Description :req.body.description,
                    Image : req.files.map((file)=>file.filename)
                // Image : croppedImageData.map((file)=>file.filename)
            })

        // newProduct.Image = JSON.parse(croppedImageData)
            await newProduct.save()
        
            res.redirect('Product')
        }

    } catch (error) {
        console.log("Error Occuerd  in Addproduct",error)
    }
}

const DeletProduct = async(req,res) => {
    try {
        console.log("Route reached in DeleteProduct");

        const  Product_Id = req.query.id
        console.log(Product_Id)
        const Delete = await ProductSchema.deleteOne({_id:Product_Id})

        res.redirect('Product')
        
    } catch (error) {
        console.log("Error on Admin DeleteProduct",error)
    }
}

const LoadEditProduct = async(req,res) =>{
    try {
        const Product_Id = req.query.id
        console.log(Product_Id);
        const ProductData = await ProductSchema.findById({_id:Product_Id})
        console.log(ProductData);
        res.render('EditProduct',{Product:ProductData})
    } catch (error) {
        console.log("Error occuered on LoadEditProduct",error)
    }
}


const EditProduct = async (req, res) => {
    console.log(req.body.id);
    const Product_ID = req.body.id;
    console.log("Product ID : ", Product_ID);

    // Exclude the '_id' field from ProductData
    const ProductDataToUpdate = {
        Name: req.body.name,
        Price: req.body.price,
        Category: req.body.category,
        Size: req.body.size,
        Stock: req.body.stock,
        Description: req.body.description
    };

    console.log(ProductDataToUpdate);

    if (req.files) {
        ProductDataToUpdate.Image = req.files.map((file) => file.filename)
    }

    try {
        
        const updateProduct = await ProductSchema.findByIdAndUpdate(Product_ID, ProductDataToUpdate, { new: true });
        console.log('Updated product:', updateProduct);
        console.log("Update Success");
        res.redirect('Product');
    } catch (error) {
        console.log("Error Occurred on EDITPRODUCT", error);
    }
};

const LoadCategory = async(req,res) => {
    try {
        res.render('Category')
    } catch (error) {
        console.log("Error on Catogory controll : >>",error)
    }
}

const CreateCategory = async(req,res) => {
    try {
        InputCategory = req.body.name
        isExict = await Category.findOne({Name:InputCategory})
        if(isExict){
            res.render('Category',{message:"Category All ready Exict"})
        }else{
            const NewCategory = new Category({
                Name : req.body.name,
                Description : req.body.description
            })
            const NewCategoryCreate = await NewCategory.save()
            res.redirect('Product')
        }
        
    } catch (error) {
        console.log("Error On CreaateCategory  : >>",error)
    }
}

const DeletCategory = async(req,res) => {
    try {
        const CategoryID = req.query.id
        console.log(CategoryID);
        const DeleteCategory =  await Category.deleteOne({_id:CategoryID})
        console.log("Successs")
        res.redirect('Product')
        // ,{ successMessage: 'Successfully Deleted the User' }
    } catch (error) {
        console.log("Error ON DeleteCategory",error)
    }
}

const UnlistCategory = async(req,res) => {
    try {
        const CategoryID = req.query.id
        const CategoryData = await Category.findById(CategoryID)
        
        let UpdateCategory ;
        if(CategoryData.IsList){
            UpdateCategory = await Category.findByIdAndUpdate(CategoryID, {$set:{IsList:false}}, { new: false})
            console.log("Invoked False >> ",UpdateCategory);
            res.redirect('Product')
        }else{
            UpdateCategory = await Category.findByIdAndUpdate(CategoryID, {$set:{IsList:true}}, {new:true})
            console.log("Invoked True >> ",UpdateCategory);
            res.redirect('Product')
        }

    } catch (error) {
        console.log("ERROR ON UnlistCategory",error)
    }
}


module.exports = {
    DashBoard,
    Login,
    isLogin,
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
    UnlistCategory
}