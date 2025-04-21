import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'
import crypto from 'crypto'  // Make sure to import crypto to generate UUID

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const { name, email, password } = await req.json()

  // Basic validation of user input
  if (!email || !password || !name) {
    return NextResponse.json({ message: 'All fields are required.' }, { status: 400 })
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return NextResponse.json({ message: 'User already exists' }, { status: 400 })
  }

  // Hash the password before saving
  const hashedPassword = await bcrypt.hash(password, 10)

  // Generate verification token and set expiration time (e.g., 1 hour)
  const verificationToken = crypto.randomUUID()
  const tokenExpiresAt = new Date()
  tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 1) // Token expires in 1 hour

  // Create user record
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      verificationToken,
      tokenExpiresAt,
    },
  })

  // Send verification email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // your Gmail address
      pass: process.env.EMAIL_PASS, // your Gmail App Password
    },
  })

  const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/?token=${verificationToken}`

  const mailOptions = {
    from: `"SecondHand Company" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Please verify your email',
    html: `
      <h1>Welcome, ${name}!</h1>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationLink}">${verificationLink}</a>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return NextResponse.json({ message: 'User registered, please verify your email' })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json({ message: 'Failed to send verification email. Please try again later.' }, { status: 500 })
  }
}
