import express from 'express';
 
import {Signup ,  Login,  GoogleSignin, getUsers, refreshToken    } from '../controllers/ct_user.js';
const router = express.Router();

router.post('/signup', Signup);
router.post('/login', Login);
router.post('/google-signin', GoogleSignin);
router.get('/users', getUsers);
router.post('/refresh', refreshToken);


export default router;