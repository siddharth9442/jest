class ApiError extends Error {
    constructor (
        statusCode,
        message,
        errors = [],
    ) {
        super(message);
        this.data = null;
        this.statusCode = statusCode;
        this.message = message;
        this.status = false;
        this.errors = errors;
    }
}

export { ApiError };