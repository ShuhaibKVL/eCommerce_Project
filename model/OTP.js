const mongoose = require('mongoose')
const mailSender = require('../utils/MailSender')

const otpSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now,
        expires: 60 * 4
    }
})

async function sendVerificaton(email,otp) {
    console.log("send verification INVOKED")
    try {
        
        const mailResponse = await mailSender(
            email,
            "Verification Email",
            `<h1>Please confirm your password</h1>
            <p>Here is your OTP code :</p>
            <h2 style ="color:red;">OTP : ${otp}</h2>
            <p>Do not share the otp anywhere</p>`
        )
        console.log("Email send Successfully  :",mailResponse)
    } catch (error) {
        console.log("Error Occuered while sending email : > ", error)
        throw error
    }
}

otpSchema.pre('save',async function (next){
    
    console.log("New document saved to the Database")
    if(this.isNew) {
        await sendVerificaton(this.email, this.otp)
    }
    next()
})

module.exports = mongoose.model("OTP",otpSchema)