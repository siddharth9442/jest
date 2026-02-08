import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt';

const adminSchema = new Schema({
    fullName: { type: String },
    username: { type: String, trim: true, lowercase: true },
    password: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    status: { type: Number, default: 1, enum: [ 1, 9 ] },  // 1: active, 9: deleted
    accessToken: { type: String },
    refreshToken: { type: String }
}, { timeseries: true });


adminSchema.pre('save', async function (next) {
    if(this.isModified("password")) {
        try {
            this.password = await bcrypt.hash(this.password, 10);
            return next();
        } catch (error) {
            console.log("Error while hashing password");
            next(error);
        }
    } else {
        next();
    }
});

adminSchema.methods.isPasswordValid = async function(password) {
    return await bcrypt.compare(password, this.password);
}

const Admin = mongoose.model("admin", adminSchema, "admins");
export default Admin;