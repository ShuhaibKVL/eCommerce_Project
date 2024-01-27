const otpGenerator= require("otp-generator")
const OTP = require('../model/OTP')

 // Otp creation Section
                            
 const otp_Gen_Fun = async(req,res) => {


        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        
        let result = await OTP.findOne({ otp: otp });
        
        while (result) {
            otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            });
            result = await OTP.findOne({ otp: otp });
        }
        
        
        const email = req.body.email
        
        const otpPayload = { email , otp }
        
        const otpBody = await OTP.create(otpPayload)
        
        console.log(otpBody)

        return otpBody;

}

module.exports = otp_Gen_Fun

