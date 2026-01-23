import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const uri = `${process.env.MONGODB_URI}/${DB_NAME}`;

export async function connectDb() {
    try {
        await mongoose.connect(uri);
    } catch (error) {
        console.log("Error connecting mongoDB: ", error);
        process.exit(1);
    }
}