const whishList = require('../model/Whishlist')
const userController  = require('../control/usercontrol')
const ProductModel = require('../model/Product')
const categoryMOdel = require('../model/Category')

const redirectTOloadFilterPage = async(req,res) => {
    try {
        const searchInput = req.body.query
        res.json({status:"success",searchInput:searchInput})
    } catch (error) {
        console.log(("Error on LoadfilterProduct CONTROLLLER :",error));
    }
}

const LoadfilterProduct = async(req,res) => {
    
    try {
        const query = req.query.query
        console.log("LoadfilterProduct query : ",query);

        console.log("PAgination query is > ",req.query.page);

         // Construct a regex pattern to match the query string (case-insensitive)
        const regexPattern = new RegExp(query, 'i');
        // Define the search criteria
        const searchCriteria = {
            $or: [
                { Name: { $regex: regexPattern } },// Match product name
                {Price: { $regex: regexPattern }},
                {Category: { $regex: regexPattern }},
                {Size: { $regex: regexPattern }},
                { Description: { $regex: regexPattern }}
            ]
        };
        
        const page = req.query.page || 1;
        const limit = 9;
        const skip = (page - 1) * limit;
        const productsTOCount = await ProductModel.find(searchCriteria)
        const totalProducts = productsTOCount.length
        const totalPages = Math.ceil(totalProducts / limit);

        // Execute the query to find products that match the search criteria
        const products = await ProductModel.find(searchCriteria).skip(skip).limit(limit)

        // CAtegory to show filters
        const category = await categoryMOdel.find()
        //Best sellers
        const allProducts = await ProductModel.find()

        // console.log("The sending datas :> ",allProducts);
        
        res.render('filterProduct',{products:products,category:category,allProducts:allProducts,totalPages:totalPages,query:query})
    } catch (error) {
        console.log(("Error on LoadfilterProduct CONTROLLLER :",error));
    }
}

const searchInput = async(req,res) => {
    try {
        const query = req.query.query
        
        console.log("search input is : ",query);

        console.log("the pagination page : >",req.query.page);

         // Construct a regex pattern to match the query string (case-insensitive)
        const regexPattern = new RegExp(query, 'i');
        // Define the search criteria
        const searchCriteria = {
            $or: [
                { Name: { $regex: regexPattern } },// Match product name
                {Price: { $regex: regexPattern }},
                {Category: { $regex: regexPattern }},
                {Size: { $regex: regexPattern }},
                { Description: { $regex: regexPattern }}
            ]
        };

        const page = req.query.page || 1;
        const limit = 9;
        const skip = (page - 1) * limit;

        // Execute the query to find products that match the search criteria
        const totalProducts = await ProductModel.find(searchCriteria)

        const totalProductsLength = totalProducts.length
        const totalPages = Math.ceil(totalProductsLength / limit);
        
        // Execute the query to find products that match the search criteria
        const products = await ProductModel.find(searchCriteria).skip(skip).limit(limit)
        // console.log("search output : ",products);
        
        res.json({products:products,query:query,totalPages:totalPages})
    } catch (error) {
        console.log("Error on searchInput Controller",error);
    }
}

const filterProducts = async(req,res) => {
    try {
        const Input = req.query.input
        const page = req.query.page || 1
        console.log(" <<>>",Input,page);


        const query = Input
        const limit = 9
        const skip = (page - 1) * limit
        const totalProducts = await ProductModel.find({Category:Input})
        const totalProductsLength = totalProducts.length

        const totalPages =Math.ceil(totalProductsLength / limit)
        const products =  await ProductModel.find({Category:Input}).skip(skip).limit(limit)

        res.json({products:products,query:query,totalPages:totalPages})

    } catch (error) {
        console.log("ERROR on filterProducts CONTROLLER : ",error);
    }
}

module.exports = {
    redirectTOloadFilterPage,
    LoadfilterProduct,
    searchInput,
    filterProducts
}