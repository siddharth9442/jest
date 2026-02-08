import { ApiError } from "../utils/apiError.js";
import jwt from 'jsonwebtoken';
import * as Model from '../models/index.js';

export async function verifyUser(req, _, next) {
    try {
        const token = req.cookie?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if(!token) throw new ApiError(401, "Unauthorized request.");

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE);

        const user = await Model.User.findById(decodedToken._id).select("-password -refreshToken");

        if(!user) throw new ApiError(401, "Invalid access token");
        
        req.user = user;
        next();
    } catch (error) {
        console.log("Error in AuthMiddleware.verifyUser: ", error);
        next(error);
    }
}

export async function verifyAdmin(req, _, next) {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if(!token) throw new ApiError(401, "Unauthorized request.");

        const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRETE);
        
        const admin = await Model.Admin.findById(decodedToken?._id).select("-password -refreshToken");

        if(!admin) throw new ApiError(401, "Invalid access token.");
        
        req.admin = admin;
        next();
    } catch (error) {
        console.log("Error in AuthMiddleware.verifyAdmin: ", error);
        next(error);
    }
}