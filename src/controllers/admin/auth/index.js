import { Router } from "express";
import { verifyAdmin } from "../../../middlewares/auth.middleware.js";
import { 
    createAdmin,
    login,
    logout,
    refreshAccessToken
} from "./adminAuth.controller.js";

const router = Router();

router.post('/register', createAdmin);

router.post('/login', login);

router.post('/logout', verifyAdmin, logout);

router.post('/refresh', verifyAdmin, refreshAccessToken);

export default router;