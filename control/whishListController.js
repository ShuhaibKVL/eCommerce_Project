const whishList = require('../model/Whishlist')
const userController  = require('../control/usercontrol')

const addToWhishList = async(req,res) => {
    console.log("invoked addTowishList controller");
    try {
        if(!req.session.user_id){
            res.redirect('/login')
        }else{
            
            const productId = req.query.id
            const isExcistProduct = await whishList.findOne({ProductId:productId})
            
            if(isExcistProduct){
                console.log("Product All ready Added");
            }else{
                const newWhishList = new whishList({
                    UserId:req.session.user_id,
                    ProductId:productId
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
            const products = await whishList.find({UserId:req.session.user_id}).populate('ProductId')
            console.log("The whishList Product is are : ",products);
            res.render('whishList',{Product:products})
        }
    } catch (error) {
        console.log("Error on loadWhishList CONTROLLER :",error );
    }
}

const  remove_from_whish_list = async(req,res) => {
    try {
        const UserID = req.session.user_id
        const ProductId = req.body.productId
        await whishList.deleteOne({UserId:UserID})
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

