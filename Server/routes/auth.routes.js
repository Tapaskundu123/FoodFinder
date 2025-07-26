import express from 'express';
import {login, register, logout, verifyOtpChangePassword , verifyEmailChangePassword, resetNewPassword} from '../Controllers/auth.controllers.js';
import { UserAuthMiddleware } from '../middleware/userAuth.js';

const authrouter= express.Router();

authrouter.post('/register',register);
authrouter.post('/login',login);
authrouter.post('/logout',logout);

// updated
authrouter.post('/verify-Email-ChangePassword',verifyEmailChangePassword);

authrouter.post('/verify-OTP-changePassword',UserAuthMiddleware,verifyOtpChangePassword );

authrouter.post('/reset-password',UserAuthMiddleware,resetNewPassword);

export default authrouter;
