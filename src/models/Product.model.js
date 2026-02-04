import mongoose, { Schema } from "mongoose";

const productSchema = new Schema({
    _id: { type: Schema.Types.ObjectId },
    name: { type: String, uppercase: true }, 
    price: { type: Number },
    stock: { type: Number },
    isActive: { type: Boolean },
    version: { type: Number }
}, { timeseries: true });

const Product = mongoose.model("Products", productSchema, "products");

export default Product;