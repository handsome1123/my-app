import { NextRequest, NextResponse } from "next/server";
import promptpay from "promptpay-qr";
import QRCode from "qrcode";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Get product price from query parameter, default to 0 if not provided
  const amount = parseFloat(searchParams.get("amount") || "0");

  // PromptPay number/phone number 
  const promptpayID = "0983744826";

  // Generate payment payload with dynamic amount
  const payload = promptpay(promptpayID, { amount });

  // Convert to QR image (base64)
  const qrImage = await QRCode.toDataURL(payload);

  return NextResponse.json({ qrImage });
}
