export default class HttpException extends Error {
  statusCode: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.statusCode = statusCode ?? 400;
    Object.setPrototypeOf(this, HttpException.prototype);
  }
}
