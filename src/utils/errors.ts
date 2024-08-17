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

class ConfigLoadingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigLoadingError';
  }
}

class FirebaseInitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FirebaseInitError';
  }
}

export { ApiRequestError, InvalidApiResponseError, ConfigLoadingError, FirebaseInitError };