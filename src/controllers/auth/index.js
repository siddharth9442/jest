import { Router } from "express";
import { verifyUser } from "../../middlewares/auth.middleware.js";
import { 
    login,
    register,
    logout,
    refreshAccessToken
} from "./auth.controller.js";

const router = Router();

//  /api/auth/register
router.post('/register', verifyUser, register);

//  /api/auth/login
router.post('/login', verifyUser, login);

//  /api/auth/logout
router.post('/logout', verifyUser, logout);

//  /api/auth/refresh
router.post('/refresh', verifyUser, refreshAccessToken);

export default router;