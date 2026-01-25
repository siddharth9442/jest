import jwt from 'jsonwebtoken';

export async function generateAccessToken(user) {
    const payload = {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email
    };
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRETE, { expiresIn: "15m" });
}

export async function generateRefreshToken(user) {
    const payload = {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email
    };
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRETE, { expiresIn: "7d" });
}