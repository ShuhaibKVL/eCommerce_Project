const whishList = require('../model/Whishlist')
const userController  = require('../control/usercontrol');
const Product = require('../model/Product')

const addToWhishList = async(req,res) => {
    console.log("invoked addTowishList controller");
    try {
        if(!req.session.user_id){
            res.redirect('/login')
        }else{
            
            const productId = req.query.id
            const isExist = await whishList.findOne({UserId:req.session.user_id})
            console.log("whishList found :",isExist);

            if(isExist){
                
                const productExists = isExist.Product.some(product => product.ProductId.equals(productId));
                console.log(productExists);
                if(productExists){
                    console.log("All ready Added");
                }else{
                    isExist.Product.push({ProductId:productId})
                await isExist.save()
                console.log(isExist);
                }
                
            }else{
                const newWhishList = new whishList({
                    UserId:req.session.user_id,
                    Product:{
                        ProductId:productId
                    }
                    
                })
                await newWhishList.save()
            }
            
        }
    } catch (error) {
        console.log("Error on addToWhishList CONTROLLER : > ",error);
    }
}

const loadWhishList = async(req,res) => {
    try {
        if(!req.session.user_id){
            res.redirect('login')
        }else{
            const products = await whishList.find({UserId:req.session.user_id}).populate('Product.ProductId')
            console.log("The whishList Product is are : ",products);
            products.forEach(product => {
                product.Product.forEach(element => {
                    console.log(element.ProductId);
                });
            });
            res.render('whishList',{whishList:products})
        }
    } catch (error) {
        console.log("Error on loadWhishList CONTROLLER :",error );
    }
}

const  remove_from_whish_list = async(req,res) => {
    try {
        const UserID = req.session.user_id
        const productId = req.body.productId
        const removeWhishList = await whishList.updateOne({UserId:UserID},{$pull:{Product:{ProductId:productId}}})
        console.log(removeWhishList);

        res.redirect('/loadWhishList')
    } catch (error) {
        console.log("Error on remove from whish list CONTROLLER : ",error);
    }
}

module.exports = {
    addToWhishList,
    loadWhishList,
    remove_from_whish_list
}

