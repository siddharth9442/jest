class ApiError extends Error {
    constructor (
        statusCode,
        message,
        errors = [],
    ) {
        super(message);
        this.statusCode = statusCode;
        this.status = false;
        this.message = message;
        this.data = null;
        this.errors = errors;
    }
}

export { ApiError };