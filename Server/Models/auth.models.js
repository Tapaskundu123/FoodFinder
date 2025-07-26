import mongoose from "mongoose";
const AuthSchema= new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    verifyOtp:{
        type:String,
        default:0
    },
    verifyOtpExpiredAt:{
        type:Date,
        default:0
    },
    isEmailVerified:{
        type:Boolean,
        default:false
    },
    resetOTP:{
        type:String,
        default:false
    },
    resetOTPExpiredAt:{
        type: Date,
        default:0
    }
})

export const AuthModel= mongoose.model('Auth',AuthSchema);
