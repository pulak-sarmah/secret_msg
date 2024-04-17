import { getServerSession } from 'next-auth'
import authOptions from '../auth/[...nextauth]/options'
import prisma from '@secret-hub/db/client'
import { NextRequest } from 'next/server'
import { User } from 'next-auth'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  const user: User | undefined = session?.user

  if (!session || !session.user) {
    return Response.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }

  const userId = user?.id

  try {
    const userWithMessages = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!userWithMessages) {
      return Response.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    if (userWithMessages.messages.length === 0) {
      return Response.json(
        { success: false, messages: 'no messages found' },
        { status: 401 }
      )
    }
    return Response.json(
      { success: true, messages: userWithMessages.messages },
      { status: 200 }
    )
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: 'Failed to get messages',
      },
      {
        status: 401,
      }
    )
  }
}
