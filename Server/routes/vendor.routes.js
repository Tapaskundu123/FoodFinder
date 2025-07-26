import express from 'express';
import {stallDetails} from '../controllers/vendor.controller.js'
const vendorRouter= express.Router();

vendorRouter.post('/detailsOfStall',stallDetails);

export default vendorRouter;