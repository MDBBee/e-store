class CustomAPIError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const customErrorBuilder = (message, sCode) => {
  return new CustomAPIError(message, sCode);
};

module.exports = { CustomAPIError, customErrorBuilder };
