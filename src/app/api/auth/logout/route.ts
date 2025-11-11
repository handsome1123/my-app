import { NextResponse } from "next/server";

export async function POST() {
  // Clear the cookie
  const response = NextResponse.json({ message: "Logged out successfully" });
  response.cookies.set({
    name: "token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0, // expires immediately
  });

  // Also clear the sb-access-token cookie used by middleware
  response.cookies.set({
    name: "sb-access-token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0, // expires immediately
  });

  return response;
}
