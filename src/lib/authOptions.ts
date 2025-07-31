// lib/authOptions.ts ✅

import { AuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { Session, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from './mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { mock } from 'node:test';
import { mockUser } from '@/lib/userData';
import { use } from 'react';

export const authOptions: AuthOptions = {
  session: { strategy: 'jwt' },
  // secret: process.env.AUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        
        //Debug
        const hashed = bcrypt.hashSync("password", 10);
        console.log(hashed);

        // For MongoDB
        // await dbConnect();
        // const user = await User.findOne({ email: credentials?.email });
        // if (!user) return null;
        // const isValid = await bcrypt.compare(credentials!.password, user.password);
        // if (!isValid) return null;

        // return {
        //   id: user._id.toString(),
        //   email: user.email,
        //   role: user.role,
        // };

        //For mock Data
        const user = mockUser.find(u => u.email === credentials?.email)
        if (!user) return null;

        const isValid = await bcrypt.compare(credentials!.password, user.password)
        if(!isValid) return null;

        return{
          id: user.id,
          email: user.email,
          role: user.role,
        }

      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: NextAuthUser }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'admin' | 'seller' | 'buyer';
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
