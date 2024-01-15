
const nodemailer = require('nodemailer')

const mailSender = async (email, title , body) => {
    try {
           // Transporter to send email
        let transporter = nodemailer.createTransport({
            // host:process.env.MAIL_HOST,
            service:"gmail",
            auth:{
                user: process.env.MAIL_USER,
                pass:process.env.MAIL_PSSS
            }
        })

            // Configure email content
            
        let info = await transporter.sendMail({
            from:"www.mshuhabkvl.me - Muhammed Shuhaib",
            to:email,
            subject:title,
            html:body
        })
        console.log("Email Info : > ",info)
    
        
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = mailSender