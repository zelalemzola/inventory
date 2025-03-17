import mongoose from 'mongoose'

 async function dbConnect(){
       await mongoose.connect('mongodb+srv://zola:zola@cluster0.8oaktx9.mongodb.net/inventory');
       console.log("db connected");
} 

export default dbConnect;