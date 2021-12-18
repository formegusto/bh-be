class ResponseError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "Response Error";
    this.statusCode = statusCode;
  }
}

export default ResponseError;
