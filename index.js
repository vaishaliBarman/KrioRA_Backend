import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import router from './routers/rt_user.js';
import EventRouter from './routers/rt_Event.js'
import favRouter from './routers/rt_fav.js'
 
dotenv.config();
const app = express();
 
// app.use(cors({
//   origin:  "http://localhost:5173",
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true
// }))
// app.use(express.json())
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ["https://krio-ra-vaishali-s-projects.vercel.app/", "http://localhost:5173"] 
    : "http://localhost:5173",
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
app.use('/user', router)
app.use('/favorites', favRouter)
app.use('/event', EventRouter)

app.get("/", (req, res) => {
  res.send("Backend is running successfully!");
});
 

app.listen(POST, ()=> console.log(`Server is running on port ${POST}`))
 