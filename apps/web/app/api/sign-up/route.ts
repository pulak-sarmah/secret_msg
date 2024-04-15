import prisma from '@secret-hub/db/client'
import bcrypt from 'bcryptjs'
import { sendVerificationEmail } from '../../../utils/sendVerificationEmail'
import { NextRequest } from 'next/server'
import { signUpSchema } from '../../schemas/signUpSchema'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validatedUser = await signUpSchema.safeParseAsync(body)
    if (!validatedUser.success) {
      return Response.json(
        { success: false, message: validatedUser.error.format() },
        { status: 400 }
      )
    }
    const { username, email, password } = validatedUser.data

    const existingUserByUserName = await prisma.user.findUnique({
      where: { username },
    })
    if (existingUserByUserName) {
      const oneHourAgo = new Date()
      oneHourAgo.setHours(oneHourAgo.getHours() - 1)
      if (existingUserByUserName.isVerified) {
        return Response.json(
          { success: false, message: 'Username already exists' },
          { status: 400 }
        )
      } else if (existingUserByUserName.createdAt < oneHourAgo) {
        // Delete the unverified user if they were created more than an hour ago
        await prisma.user.delete({ where: { id: existingUserByUserName.id } })
      } else {
        return Response.json(
          { success: false, message: 'Username is temporarily unavailable' },
          { status: 400 }
        )
      }
    }
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    })

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          { success: false, message: 'Email already exists' },
          { status: 400 }
        )
      } else {
        const hashedPassword = await bcrypt.hash(password, 10)
        existingUserByEmail.password = hashedPassword
        existingUserByEmail.verifyCode = verifyCode
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)

        await prisma.user.update({
          where: { id: existingUserByEmail.id },
          data: existingUserByEmail,
        })
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10)
      const expiryDate = new Date()
      expiryDate.setHours(expiryDate.getHours() + 1)

      await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          verifyCode,
          verifyCodeExpiry: expiryDate,
          isVerified: false,
          isAcceptingMessages: true,
        },
      })
    }
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    )
    if (!emailResponse.success) {
      return Response.json(
        { success: false, message: emailResponse.message },
        { status: 500 }
      )
    }
    return Response.json(
      { success: true, message: 'User registered. please verify your email' },
      { status: 201 }
    )
  } catch (error) {
    return Response.json(
      { success: false, message: 'Error registering user' },
      { status: 500 }
    )
  }
}
