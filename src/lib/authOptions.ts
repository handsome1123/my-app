import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { DatabaseService } from '@/lib/database';

export const authOptions: AuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          await DatabaseService.connect();
          const user = await DatabaseService.findUserByEmail(credentials?.email || '');
          if (!user) return null;

          const isValid = await bcrypt.compare(credentials!.password, user.password);
          if (!isValid) return null;

          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        await DatabaseService.connect();
        const existingUser = await DatabaseService.findUserByEmail(user.email || '');
        
        if (!existingUser) {
          // ✅ Enhanced: Detect provider and set appropriate fields
          const provider = account?.provider || 'credentials';
          
          await DatabaseService.createUser({
            email: user.email || '',
            name: user.name || '',
            role: 'buyer',
            provider: provider,
            emailVerified: provider !== 'credentials', // OAuth providers have verified emails
            phoneVerified: false,
          });
        }
        return true;
      } catch (error) {
        console.error('Sign in error:', error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      } else if (!token.role || !token.id) {
        try {
          const dbUser = await DatabaseService.findUserByEmail(token.email as string);
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role;
          }
        } catch (error) {
          console.error('JWT callback error:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'admin' | 'seller' | 'buyer';
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    // Remove signUp - not supported by NextAuth
    // Handle signup separately in your app routing
  },
  secret: process.env.NEXTAUTH_SECRET,
};