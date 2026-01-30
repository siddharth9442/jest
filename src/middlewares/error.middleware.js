export default function errorHandler(err, req, res, next) {
    const error = {
        statusCode: err.statusCode || 500,
        status: err.status || false,
        statusCode: err.statusCode,
        message: err.message || "Internal Server Error",
        errors: err.errors,
        data: err.data || null
    }

    return res.status(error.statusCode).json(error);
}