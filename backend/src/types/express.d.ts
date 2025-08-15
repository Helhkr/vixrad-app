declare namespace Express {
  export interface Request {
    user?: {
      userId: string;
      isAdmin: boolean;
      is_email_verified: boolean; // Added this line
    };
  }
}