import * as Model from '../../../models/index.js';
import { ApiError } from '../../../utils/apiError.js';
import { ApiResponse } from '../../../utils/apiResponse.js';

async function add(req, res, next) {
    try {
        const { name, price, stock, isActive, version } = req.body;

        // check product with same nanme already exists or not
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

        return res.json(new ApiResponse(200, newProduct, "Product added successfully."));

    } catch (error) {
        console.log("Error in ProductController.add: ", error);
        next(error);
    }
}

async function addProducts(req, res, next) {
    try {
        const { products } = req.body;

        if(!products.length) throw new ApiError(400, "Products can't be empty.");

        let productNames = products.map(p => p.name.toUpperCase());
        const existedNames = await Model.Product.distinct("name", { name: { $in: productNames } });
        if(existedNames.length) throw new ApiError(400, `'${existedNames}' these products already exists.`);

        const newProducts = await Model.Product.insertMany(products);

        return res.json(new ApiResponse(200, newProducts, "Products added successfully."));
    } catch (error) {
        console.log("Error in ProductController.addProducts: ", error);
        next(error);
    }
}

async function update(req, res, next) {
    try {
        const productId = req.params._id;
        
        // check product with same already exists or not
        if (req.body.name) {
            const isExists = await Model.Product.findOne({ name: req.body.nam.toUpperCase() }).select("_id");
            if(isExists) throw new ApiError(409, "Product with same name already exists.");
        }

        if (req.body.price < 0) {
            throw new ApiError(400, "Price cannot be less than zero.");
        }

        if (req.body.stock < 0) {
            throw new ApiError(400, "Stock cannot be less than zero.");
        }

        const allowedKeys = Object.keys(req.body);
        const updateObj = {};
        allowedKeys.forEach((key) => {
            if (req.body[key] !== undefined) {
                updateObj[key] = req.body[key];
            }
        });
        
        const products = await Model.Product.findByIdAndUpdate(productId, { $set: updateObj }, { new: true });

        return res.json(new ApiResponse(200, products, "Product data updated successfully."));
    } catch (error) {
        console.log("Error in ProductController.update: ", error);
        next(error);
    }
}

export {
    add,
    addProducts,
    update
};