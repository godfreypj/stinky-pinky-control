class ApiRequestError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ApiRequestError';
    }
  }
  
class InvalidApiResponseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidApiResponseError';
    }
}

export { ApiRequestError, InvalidApiResponseError };