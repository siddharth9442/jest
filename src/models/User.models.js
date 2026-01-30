import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt';

const userSchema = new Schema({
    fullName: { type: String, require: true },
    username: { type: String, trim: true, unique: true },
    email: { type: String, trim: true, unique: true },
    password: { type: String, trim: true, require: true },
    avatar: { type: String },
    address: { 
        line1: { type: String },
        line2: { type: String },
        city: { type: String },
        pincode: { type: Number }
    },
    mobileNo: { type: String },
    accessToken: { type: String },
    refreshToken: { type: String }
}, { timestamps: true });

// hash password
userSchema.pre('save', async function (next){
    if(this.isModified("password")) {
        try {
            this.password = await bcrypt.hash(this.password, 10);
            return next();
        } catch (error) {
            console.log("Error while hashing password: ", error);
            next(err);
        }
    } else {
        next();
    }
});

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
}

const User = mongoose.model('Users', userSchema, 'users');
export default User;