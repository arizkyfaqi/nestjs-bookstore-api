declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
        role: 'admin' | 'customer';
      };
    }
  }
}

export {};
