import * as Model from '../../models/index.js';
import { ApiError } from '../../utils/apiError.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { generateAccessToken, generateRefreshToken } from '../../utils/token.js';

async function register(req, res) {
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
            throw new ApiError("409", "User with email or username already exists");
        }

        const user = await Model.User.create(payload);

        const newUser = await Model.User.findById(user._id).select("-password -refreshToken").lean();

        if (!newUser) throw new ApiError("500", "Something went wrong while registering user");

        return res.json(new ApiResponse(200, newUser, "User registered successfully"));


    } catch (error) {
        console.log("Error in AuthController.register: ", error);
    }
}

async function login(req, res) {
    try {
        const { username, email, password } = req.body;

        if (!username && !email) {
            throw new ApiError(400, "username or email is exists");
        }

        const user = await Model.User.findOne({
            $or: [{ email: email }, { username: username }]
        }).lean();

        if (!user) throw new ApiError(400, "User does not exists");

        const isPasswordValid = user.isPasswordCorrect(password);
        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid user credentials");
        }

        const accessToken = await generateAccessToken(user);
        const refreshToken = await generateRefreshToken(user);

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
    }
}

async function logout(req, res) {
    try {
        await Model.User.findByIdAndUpdate(
            req.params._id,
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
            .clearCookie("accessToken")
            .clearCookie("refreshToken")
            .json(200, {}, "User logged out successfully")
    } catch (error) {
        console.log("Error in AuthController.logout: ", error);
    }
}

export {
    register,
    login,
    logout
}