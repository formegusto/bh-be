declare namespace Express {
  export interface Request {
    loginUser?: {
      id: number;
      username: string;
      role: string;
    };
    decryptKey?: string;
  }
}
