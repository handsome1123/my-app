import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma"; // Update with your actual Prisma client path
import { prisma } from "@/lib/prisma"; // Assuming Prisma is configured here

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ message: "Token not provided" }, { status: 400 });
  }

  try {
    // Find the user by verification token
    const user = await prisma.user.findUnique({
      where: {
        verificationToken: token,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 });
    }

    // Update the user to mark them as verified
    await prisma.user.update({
      where: { id: user.id },
      data: { verified: true, verificationToken: null }, // Nullify the token after verification
    });

    return NextResponse.json({ message: "Email successfully verified!" });
  } catch (error) {
    return NextResponse.json({ message: "An error occurred during verification", error: error.message }, { status: 500 });
  }
}
