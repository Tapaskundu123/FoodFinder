import express from 'express';
import {stallDetails} from '../controllers/vendor.controller.js'
import { UserAuthMiddleware } from '../middlewares/auth.middleware.js';
const vendorRouter= express.Router();

vendorRouter.post('/detailsOfStall',UserAuthMiddleware,stallDetails);

export default vendorRouter;