import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
console.log(process.env.MONGODB_URI);

const connectDB = async () => {
    mongoose.connection.on('connected', () => console.log("Database connected"));
    await mongoose.connect(`${process.env.MONGODB_URI}/mint`);
};

export default connectDB;