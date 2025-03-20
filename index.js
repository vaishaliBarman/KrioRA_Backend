import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import router from './routers/rt_user.js';
import EventRouter from './routers/rt_Event.js'
import favRouter from './routers/rt_fav.js'
 
dotenv.config();
const app = express();
 
app.use(cors({
  origin:  "http://localhost:5173",
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))
app.use(express.json())

const POST  = process.env.PORT || 5002;
const DataBase = process.env.MONGODB

if (!DataBase) {
  console.error("MongoDB connection string is missing in .env file");
  process.exit(1);
}

mongoose.connect(DataBase)
.then(()=> console.log('Database connected'))
.catch(err => console.log(err, 'Database not connected'))
//router
app.use('/', router)
app.use('/favorites', favRouter)
app.use('/', EventRouter)

app.listen(POST, ()=> console.log(`Server is running on port ${POST}`))
 