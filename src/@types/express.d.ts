declare namespace Express {
  export interface Request {
    loginUser?: {
      id: number;
      username: string;
      role: string;
    };
    symmetricKey?: string;
    isRequiredDecrypt?: boolean;
  }
  export interface Response {
    exclude?: string[];
    custom?: {
      status: number;
      body: any;
    };
  }
}
