
const isLogin = async(req,res,next) => {
    try {
        if(req.session.admin_id){
            console.log("admin id >> ",req.session.admin_id);
            res.redirect('/DashBoard')
        }else{
            next()
        }
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}

const isLogout = async(req,res,next) =>{
    try {
        if(req.session.admin_id){
            next()
        }else{
            console.log("isLogout middleware : ",req.session.admin_id)
            res.redirect('/admin/')
        }
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}

module.exports = {
    isLogin,
    isLogout
}