export default class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.codeName = code;
  }
}