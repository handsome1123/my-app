// src/lib/jwtHelper.ts
import jwt from "jsonwebtoken";

export interface JwtPayloadExtended {
  sub?: string;
  userId?: string;
  id?: string;
}

export async function resolveUserIdFromToken(token: string | null): Promise<string | null> {
  if (!token) return null;
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) return null;

  try {
    const payload = jwt.verify(token, jwtSecret);
    if (typeof payload === "string") return null;
    const data = payload as jwt.JwtPayload & JwtPayloadExtended;
    return data.sub || data.userId || data.id || null;
  } catch {
    return null;
  }
}
