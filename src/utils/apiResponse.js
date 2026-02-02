class ApiResponse {
    constructor(statusCode, data, message){
        this.statusCode = statusCode;
        this.message = message;
        this.success = true;
        this.data = data;
    }
}

export { ApiResponse };