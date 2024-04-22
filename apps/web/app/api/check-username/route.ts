import { z } from 'zod'
import prisma from '@secret-hub/db/client'
import { usernameValidation } from '../../schemas/signUpSchema'
import { NextRequest } from 'next/server'

const UsernameQuerySchema = z.object({
  username: usernameValidation,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParam = {
      username: searchParams.get('username'),
    }
    const result = UsernameQuerySchema.safeParse(queryParam)
    if (!result.success) {
      return Response.json(
        {
          success: false,
          message: result.error.format().username?._errors || [],
        },
        { status: 400 }
      )
    }
    const { username } = result.data

    const existingVerifiedUser = await prisma.user.findUnique({
      where: { username, isVerified: true },
    })

    if (existingVerifiedUser) {
      return Response.json(
        { success: false, message: 'Username already exists' },
        { status: 400 }
      )
    }

    return Response.json(
      { success: true, message: 'Username is available' },
      {
        status: 200,
      }
    )
  } catch (error) {
    return Response.json(
      { success: false, error: 'Error checking username' },
      { status: 500 }
    )
  }
}
