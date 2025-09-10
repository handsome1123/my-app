import { NextResponse } from "next/server";

export async function POST() {
  // In JWT auth, logout is handled client-side by deleting the token
  return NextResponse.json({ message: "Logged out successfully" });
}
