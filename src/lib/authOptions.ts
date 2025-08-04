import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
// import FacebookProvider from 'next-auth/providers/facebook';
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
    // FacebookProvider({
    //   clientId: process.env.FACEBOOK_CLIENT_ID!,
    //   clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    // }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await DatabaseService.connect();
        const user = await DatabaseService.findUserByEmail(credentials.email);
        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
  async signIn({ user, account }) {
    if (!user?.email) return false;

    const email = user.email.toLowerCase();
    const domain = email.split('@')[1]?.toLowerCase();
    const allowedDomains = ['lamduan.mfu.ac.th', 'gmail.com'];

    if (!domain || !allowedDomains.includes(domain)) {
      console.log(`🚫 Domain not allowed: ${domain}`);
      return false;
    }

    await DatabaseService.connect();
    const existingUser = await DatabaseService.findUserByEmail(email);

    if (!existingUser && account && ['google', 'facebook'].includes(account.provider)) {
      try {
        await DatabaseService.createUser({
          email,
          name: user.name || '',
          role: 'buyer',
          provider: account.provider,
          emailVerified: true,
          phoneVerified: false,
        });
      } catch (err) {
        console.error('❌ Error creating user:', err);
        return false;
      }
    }

    return true;
  },

  async jwt({ token, user }) {
    if (user) {
      token.id = user.id;
      token.role = user.role;
      token.name = user.name;
    } else if (token.email && (!token.role || !token.id)) {
      await DatabaseService.connect();
      const dbUser = await DatabaseService.findUserByEmail(token.email as string);
      if (dbUser) {
        token.id = dbUser._id.toString();
        token.role = dbUser.role;
        token.name = dbUser.name;
      }
    }
    return token;
  },

  async session({ session, token }) {
    if (session.user && token) {
      session.user.id = token.id as string;
      session.user.role = token.role as 'admin' | 'seller' | 'buyer';
      session.user.name = token.name as string;
    }
    return session;
  },

  async redirect({ url, baseUrl }) {
    return `${baseUrl}/dashboard`; // Always go to dashboard
  },
},

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log('🎉 SIGNIN EVENT:', {
        email: user.email,
        provider: account?.provider,
        isNewUser,
      });
    },
    async signOut({ token }) {
      console.log('👋 SIGNOUT EVENT:', { email: token?.email });
    },
  },
  debug: true,
  logger: {
    error(code, metadata) {
      console.error('🚨 NEXTAUTH ERROR:', code, metadata);
    },
    warn(code) {
      console.warn('⚠️ NEXTAUTH WARNING:', code);
    },
    debug(code, metadata) {
      console.log('🐛 NEXTAUTH DEBUG:', code, metadata);
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
