
import { UserModel } from '../Models/User.models.js';
import {transporter} from '../DB/nodemailer.js'

export const stallDetails= async(req,res)=>{
      
    const {stallName, foodType, city, phoneNumber , address, location}= req.body;

    try {
        if(!stallName || !foodType || !city || !phoneNumber || !address || !location){
            
            return res.status(400)
                      .json({success:false, message:"Missing details!"})
        }
        const createVendorDetails= new UserModel({stallName, foodType, city, phoneNumber , address, location});
        createVendorDetails.save();
        
    const mailOption={
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: 'FoodFinder Vendor details',
        text: `Your Stall details are saved at FoodFinder.`
    }

    await transporter.sendMail(mailOption);

        return res.status(200)
                  .json({success:true, message:"Details added successfully"});
       
    } 
    catch (err) {
        return res.status(500)
                 .json({success:false, message:"Something went wrong"});
    }
}
