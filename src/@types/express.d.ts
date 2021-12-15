declare namespace Express {
  export interface Request {
    loginUser?: {
      id: number;
      username: string;
      role: string;
    };
    decryptKey?: string;
  }
  export interface Response {
    exclude?: string[];
    custom?: {
      status: number;
      body: any;
    };
  }
}
