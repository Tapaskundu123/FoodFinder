import express from 'express';
import {stallDetails} from '../controllers/vendor.controller.js'
const authrouter= express.Router();


authrouter.post('/detailsOfStall',stallDetails);
