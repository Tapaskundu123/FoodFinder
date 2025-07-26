import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userModel } from '../Models/User.models.js';
import { transporter } from '../DB/nodemailer.js';

import crypto from 'crypto';

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Missing details" });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({ name, email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    //sending welcome email

    const mailOption={
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: 'Welcome to GreatStack',
        text: `welcome to GreatStack website. Your account has been created with this email id ${email}`
    }

    await transporter.sendMail(mailOption);

    return res.status(201)
              .json({ success: true, message: "User registered successfully!", User:{name} });
  } 
  catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ success: false, message: "Please enter all details" });

  try {
    const user = await userModel.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "Invalid email" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200)
              .json({ success: true,
                 message: 'Login Successfull' , 
                 user: {name: user.name}
                 });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  });
  
  return res.status(200)
            .json({ success: true, message: "User logged out" });
};

export const verifyOtpChangePassword = async (req, res) => {
  const { otp } = req.body;
  const userId = req.user?.id;
  console.log('Received OTP:', otp, 'User ID:', userId); // Debug log

  if (!userId || !otp) {
    return res.status(400).json({ success: false, message: "Missing Details" });
  }

  try {
    const User = await userModel.findById(userId);
    if (!User) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    console.log('Stored OTP:', User.verifyOtp, 'Provided OTP:', otp); // Debug log

    if (!User.resetOTP || User.resetOTP !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    console.log('OTP Expiration:', User.verifyOtpExpiredAt, 'Current Time:', Date.now()); // Debug log

    if (User.resetOTPExpiredAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP Expired" });
    }

    User.isEmailVerified = true;
    User.resetOTP = '';
    User.resetOTPExpiredAt = '';
    await User.save();

    return res.status(200).json({ success: true, message: "OTP verified Successfully" });

  } catch (err) {
    console.error('Server Error:', err); // Debug log
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


export const verifyEmailChangePassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const User = await userModel.findOne({ email });

    if (!User) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    User.resetOTP = otp;
    User.resetOTPExpiredAt = Date.now() + 15 * 60 * 1000;
    await User.save();

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Account Verification OTP',
      text: `Your OTP for resetting your password is ${otp}.`,
    });

    return res.status(200).json({
      success: true,
      message: 'OTP sent to your email',
    });

  } catch (error) {
    console.error("OTP Send Error:", error); // 👈 helpful for debugging
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const resetNewPassword= async(req,res)=>{

  try{
   const {newPassword}= req.body;
   const userId = req.user?.id;

   if(!newPassword){ 
    return res.status(400) 
             .json({success: false, message:"new password are required"})
   }

   const User= await userModel.findById(userId);

   if(!User){
     return res.status(404)
     .json({success: false, message:"Please enter the correct email!"})
   }
   
   const hashedNewPassword=await bcrypt.hash(newPassword,10);//;encrypt new password
   User.password= hashedNewPassword ;

   await User.save(); //save the new password

   return res.status(200)
             .json({success:true,message:"Password has been changed successfully"})
}   
   catch(err){
            return res.status(400)
                      .json({success:false,message: err.message})  
   }
}
