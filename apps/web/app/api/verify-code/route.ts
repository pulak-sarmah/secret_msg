import prisma from '@secret-hub/db/client'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { username, code } = await request.json()

    const decodedUsername = decodeURIComponent(username)

    const user = await prisma.user.findUnique({
      where: { username: decodedUsername },
    })

    if (!user) {
      return Response.json(
        {
          success: false,
          error: 'User not found',
        },
        {
          status: 404,
        }
      )
    }

    const isCodeValid =
      user.verifyCode === code && new Date(user.verifyCodeExpiry) > new Date()

    if (!isCodeValid) {
      return Response.json(
        {
          success: false,
          error: 'Invalid code',
        },
        {
          status: 400,
        }
      )
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
      },
    })

    return Response.json(
      { success: true, message: 'User verified successfully' },
      {
        status: 200,
      }
    )
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: 'Error verifying code',
      },
      {
        status: 500,
      }
    )
  }
}
