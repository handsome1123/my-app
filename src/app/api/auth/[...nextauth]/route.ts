// app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// Create a NextAuth handler using your custom authOptions
const handler = NextAuth(authOptions);

// Export it for both GET and POST methods
export { handler as GET, handler as POST };
