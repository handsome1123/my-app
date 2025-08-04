import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      // Add role to token from user (on first sign in)
      if (user) {
        token.role = user.role || 'buyer'; // default fallback
      }
      return token;
    },
    async session({ session, token }) {
      // Add role from token to session
      session.user.role = token.role;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
