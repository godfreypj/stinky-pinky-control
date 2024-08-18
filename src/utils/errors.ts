// src/utils/errors.ts

class CustomError extends Error {
  env: string;
  api: string;

  constructor(message: string) {
    super(message);
    this.env = process.env.PROJECT_ENV || 'unknown';
    this.api = process.env.SP_BRAIN || 'unknown';
  }
}

class ApiRequestError extends CustomError {
  constructor(message: string) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

class InvalidApiResponseError extends CustomError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidApiResponseError';
  }
}

class ConfigLoadingError extends CustomError {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigLoadingError';
  }
}

class FirebaseError extends CustomError {
  constructor(message: string) {
    super(message);
    this.name = 'FirebaseInitError';
  }
}

export { ApiRequestError, InvalidApiResponseError, ConfigLoadingError, FirebaseError };