import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { signToken } from "@/lib/jwt";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { idToken } = await req.json();

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json({ error: "Invalid Google token" }, { status: 401 });
    }

    const email = payload.email;
    const name = payload.name || "Google User";

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if not exists
      user = await User.create({
        name,
        email,
        password: undefined, // ✅ no password for Google
        role: "buyer", // default role - can be upgraded later via profile or admin
        provider: "google",
      });
    }

    // Generate JWT
    const token = signToken({ id: user._id, role: user.role });

    const response = NextResponse.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // Set the cookie for middleware
    response.cookies.set('sb-access-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
