import { Router } from "express";
import { addProduct } from "./product.controller";

const router = Router();

router.post('/add', addProduct);

export default router;