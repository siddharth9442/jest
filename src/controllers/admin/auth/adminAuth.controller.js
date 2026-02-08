import * as Model from '../../../models/index.js';
import { ApiError } from '../../../utils/apiError.js';
import { ApiResponse } from '../../../utils/apiResponse.js';
import { generateAccessToken, generateRefreshToken } from '../../../utils/token.js';
import jwt from 'jsonwebtoken';

async function createAdmin(req, res, next) {
    try {
        const { fullName, username, email, password } = req.body;

        const existedAdmin = await Model.Admin.findOne({
            $or: [{ fullName }, { username }]
        }).lean();

        if (existedAdmin) throw new ApiError(409, "User with name or username already exist");

        const admin = await Model.Admin.create({
            fullName,
            username: username.toLowerCase(),
            email,
            password
        });

        const newAdmin = await Model.Admin.findById(admin._id).select("-password");

        if (!newAdmin) throw new ApiError(500, "Something went wrong while creating admin.");

        return res.json(new ApiResponse(200, newAdmin, "Admin user created successfully."));
    } catch (error) {
        console.log("Error in AdminController.createAdmin: ", error);
        next(error);
    }
}

async function login(req, res, next) {
    try {
        const { username, password } = req.body;

        if (!username) throw new ApiError(400, "username is required.");

        const admin = await Model.Admin.findOne({ username: username.toLowerCase(), status: 1 });

        if (!admin) throw new ApiError(400, "User does not exists.");

        const isPasswordCorrect = await admin.isPasswordValid(password);

        if (!isPasswordCorrect) throw new ApiError(401, "Invalid user credentials.");

        const accessToken = await generateAccessToken(admin);
        const refreshToken = await generateRefreshToken(admin);

        if (refreshToken) {
            admin.refreshToken = refreshToken;
            await admin.save({ validateBeforeSave: true });
        }
        
        const loggedInAdmin = await Model.Admin.findById(admin._id).select("-password -refreshToken").lean();

        return res
            .status(200)
            .cookie("accessToken", accessToken)
            .cookie("refreshToken", refreshToken)
            .json(
                new ApiResponse(
                    200,
                    {
                        admin: loggedInAdmin,
                        accessToken: accessToken,
                        refreshToken: refreshToken
                    },
                    "Admin logged in successfully."
                )
            );
    } catch (error) {
        console.log("Error in AdminController.login: ", error);
        next(error);
    }
};

async function logout(req, res, next) {
    try {
        const adminId = req.admin._id;

        await Model.Admin.findByIdAndUpdate(adminId, {
            $unset: {
                refreshToken: 1
            }
        }, { new: true });

        return res
            .status(200)
            .clearCookie("refreshToken")
            .clearCookie("accessToken")
            .json(new ApiResponse(200, {}, "User logged out successfully"));
    } catch (error) {
        console.log("Error in AdminController.logout: ", error);
        next(error);
    }
}

async function refreshAccessToken(req, res, next) {
    try {
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if(!refreshToken) throw new ApiError(401, "Unauthorized request.");

        const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRETE);

        const admin = await Model.Admin.findById(decodedToken._id);

        if(!admin) throw new ApiError(401, "Invalid refresh token.");

        if(refreshToken !== admin.refreshToken) throw new ApiError(401, "Refresh token is used or expired.");

        const newAccessToken = await generateAccessToken(admin);
        const newRefreshToken = await generateRefreshToken(admin);

        if(newRefreshToken) {
            admin.refreshToken = newRefreshToken;
            admin.save();
        }
        
        return res
        .status(200)
        .cookie("refresToken", newRefreshToken)
        .cookie("accessToken", newAccessToken)
        .json(
            200,
            {
                accessToken: newAccessToken,
                refreshToken: newRfreshToken
            },
            "Access token refreshed"
        );

    } catch (error) {
        console.log("Error in AdminController.refreshAccessToken: ", error);
        next(error);
    }
}


export {
    createAdmin,
    login,
    logout,
    refreshAccessToken
}