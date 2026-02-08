import { Router } from "express";
import { verifyAdmin } from "../../../middlewares/auth.middleware.js";
import { 
    add,
    addProducts,
    update
} from "./product.controller.js";

const router = Router();

//  /api/admin/product/add
router.post('/add', verifyAdmin, add);

//  /api/admin/product/add-products
router.post('/add-products', verifyAdmin, addProducts);

//  /api/admin/product/update/:_id
router.patch('/update/:_id', verifyAdmin, update);

export default router;