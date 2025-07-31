// src/types/next-auth.d.ts

import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'buyer' | 'seller' | 'admin';
      email: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    role: 'buyer' | 'seller' | 'admin';
    email: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'buyer' | 'seller' | 'admin';
  }
}
