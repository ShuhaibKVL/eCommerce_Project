const  User = require("../model/UserSignup")
const { findById } = require("../model/OTP")

const isLogin = async(req,res,next) => {
    try {
        if(req.session.user_id){
            console.log("found")
            next()
        }else{
            console.log("NOt Found")
            res.redirect('/login')
        }
        
    }catch(error){
        console.log(error.messagge)
        next(error)
    }
}
const IsBlocked = async(req,res,next) =>{
    
    try {
        if(req.session.user_id){
            console.log("Block Middleware Invoked");

            const user_Id = req.session.user_id
            
            const user = await User.findOne({_id:user_Id})
            console.log(user)
            const status_OF_Block =user.isBlocked
            console.log(status_OF_Block);
            if(user.isBlocked){
                res.redirect('/logout')
                
            }else{
                next()
            }
            
        }else{
            console.log("not found ISblock session")
            next()
            // res.redirect('login')
        }
        
        
    } catch (error) {
        console.log("error found while ISblock MiddleWare")
    }
}

const isLogout = async(req,res,next) => {

    try {
    
        if(req.session.user_id){
            console.log("found session ")
            res.redirect('/home')
        }else{
            console.log("NOt Found")
            next()
        }
    }catch(error){
        console.log(error.messagge)
        next(error)
    }
}



module.exports = {
        isLogin ,
        isLogout,
        IsBlocked
    }