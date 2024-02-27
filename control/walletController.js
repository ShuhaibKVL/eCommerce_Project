const walletModel = require('../model/wallet')

const LoadWallet = async(req,res) => {
    try {
        const wallet = await walletModel.findOne({userId:req.session.user_id})
        
        if (wallet) {
            wallet.history.sort((a, b) => {
              // Convert the date strings to Date objects for comparison
              const dateA = new Date(a.date);
              const dateB = new Date(b.date);
              
              // Compare the dates in descending order
              return dateB - dateA;
            });
        }
        res.render('wallet',{wallet:wallet})

        
    } catch (error) {
        console.log("Error on LoadWallet Controller : ",error);
    }
}

module.exports = {
    LoadWallet
}