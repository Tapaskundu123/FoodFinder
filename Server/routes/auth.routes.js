import express from 'express';
import {
  register,
  login,
  logout,
  verifyOtpChangePassword,
  verifyEmailChangePassword,
  resetNewPassword
} from '../controllers/auth.controller.js'; // ✅ MUST include .js

import { UserAuthMiddleware } from '../middlewares/auth.middleware.js';

const authrouter= express.Router();

authrouter.post('/register',register);
authrouter.post('/login',login);
authrouter.post('/logout',logout);

// updated
authrouter.post('/verify-Email-ChangePassword',verifyEmailChangePassword);

authrouter.post('/verify-OTP-changePassword',UserAuthMiddleware,verifyOtpChangePassword );

authrouter.post('/reset-password',UserAuthMiddleware,resetNewPassword);

export default authrouter;
