import * as Model from '../../../models/index.js';
import { ApiError } from '../../../utils/apiError.js';
import { ApiResponse } from '../../../utils/apiResponse.js';

async function addProduct(req, res, next) {
    try {
        const { name, price, stock, isActive, version } = req.body;

        // check product with same already exists or not
        const isExists = await Model.Product.findOne({ name: name.toUpperCase() });

        if (isExists) {
            throw new ApiError(409, "Product with same name already exists.");
        }

        if (price < 0) {
            throw new ApiError(400, "Price cannot be less than zero.");
        }

        if (stock < 0) {
            throw new ApiError(400, "Stock cannot be less than zero.");
        }

        const product = await Model.Product.create({
            name: name.toUpperCase(),
            price,
            stock,
            isActive,
            version
        });

        if (!product) {
            throw new ApiError(500, "Something went wring while adding product.");
        }

        const newProduct = await Model.Product.findById(product._id);

        return res.json(new ApiResponse(200, newProduct, "Product added successfully"));

    } catch (error) {
        console.log("Error in ProductController.addProduct: ", error);
        next(error);
    }
}

export {
    addProduct
};