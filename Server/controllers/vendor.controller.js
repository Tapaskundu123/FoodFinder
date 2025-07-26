
import { UserModel } from '../Models/User.models.js';
import {transporter} from '../DB/nodemailer.js'

export const stallDetails= async(req,res)=>{
      
    const {stallName, foodType, city, phoneNumber , location}= req.body;

    const id= req.user.id;

    try {
        if(!stallName || !foodType || !city || !phoneNumber || !location){
            
            return res.status(400)
                      .json({success:false, message:"Missing details!"})
        }
        const user= await UserModel.findById(id);

        const createVendorDetails= user.set({stallName, foodType, city, phoneNumber , address, location});
        await createVendorDetails.save();
        
    const mailOption={
        from: process.env.SENDER_EMAIL,
        to: user.email,
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
