import * as Model from '../../models/index.js';
import { ApiError } from '../../utils/apiError.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { generateAccessToken, generateRefreshToken } from '../../utils/token.js';
import jwt from 'jsonwebtoken';

async function register(req, res, next) {
    try {
        const { fullName, username, email, password, address, mobileNo } = req.body;

        const payload = {
            fullName,
            mobileNo,
            password
        }

        if (address) payload.address = address;

        let filter = {};
        if (username) {
            payload.username = username.toLowerCase();
            filter.username = username;
        };
        if (email) {
            payload.email = email;
            filter.email = email;
        };

        const existedUser = await Model.User.findOne({
            $or: [{ email: email }, { username: username }]
        }).lean();

        if (existedUser) {
            throw new ApiError(409, "User with email or username already exists");
        }

        const user = await Model.User.create(payload);

        const newUser = await Model.User.findById(user._id).select("-password -refreshToken").lean();

        if (!newUser) throw new ApiError(500, "Something went wrong while registering user");

        return res.json(new ApiResponse(200, newUser, "User registered successfully"));

    } catch (error) {
        console.log("Error in AuthController.register: ", error);
        next(error);
    }
}

async function login(req, res, next) {
    try {
        const { username, email, password } = req.body;

        if (!username && !email) {
            throw new ApiError(400, "username or email is required");
        }

        const user = await Model.User.findOne({
            $or: [{ email: email }, { username: username }]
        });

        if (!user) throw new ApiError(400, "User does not exists");

        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid user credentials");
        }

        const accessToken = await generateAccessToken(user);
        const refreshToken = await generateRefreshToken(user);

        if(refreshToken) {
            user.refreshToken = refreshToken;
            user.save({ validateBeforeSave: true });
        }

        const loggedInUser = await Model.User.findById(user._id).select("-password -refreshToken").lean();

        return res
            .status(200)
            .cookie("accessToken", accessToken)
            .cookie("refreshToken", refreshToken)
            .json(
                new ApiResponse(
                    200,
                    {
                        user: loggedInUser,
                        accessToken,
                        refreshToken
                    },
                    "User logged in successfully"
                )
            );

    } catch (error) {
        console.log("Error in AuthController.login: ", error);
        next(error);
    }
}

async function logout(req, res, next) {
    try {
        await Model.User.findByIdAndUpdate(
            req.user._id,
            {
                $unset: {
                    refreshToken: 1
                }
            },
            {
                new: true
            }
        );

        return res
            .status(200)
            .clearCookie("accessToken")
            .clearCookie("refreshToken")
            .json(200, {}, "User logged out successfully")
    } catch (error) {
        console.log("Error in AuthController.logout: ", error);
        next(error);
    }
}

async function refreshAccessToken(req, res, next) {
    try {
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if(!refreshToken) throw new ApiError(401, "Unauthorized request.");

        const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRETE);

        const user = await Model.User.findById(decodedToken._id);

        if(!user) throw new ApiError(401, "Invalid refresh token.");

        if(refreshToken !== user.refreshToken) throw new ApiError(401, "Refresh token is expired or used.");

        const newAccessToken = await generateAccessToken(user);
        const newRefreshToken = await generateRefreshToken(user);

        if(newRefreshToken) {
            user.refreshToken = newRefreshToken;
            user.save({ validateBeforeSave: true });
        }

        return res
        .status(200)
        .cookie("accessToken", newAccessToken)
        .cookie("refreshToken", newRefreshToken)
        .json(
            200,
            {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            },
            "Access token refreshed"
        );
    } catch (error) {
        console.log("Error in AuthController.refreshAccessToken: ", error);
        next(error);
    }
}

export {
    register,
    login,
    logout,
    refreshAccessToken
}