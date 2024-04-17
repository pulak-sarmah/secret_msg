import { getServerSession } from 'next-auth'
import authOptions from '../auth/[...nextauth]/options'
import prisma from '@secret-hub/db/client'
import { NextRequest } from 'next/server'
import { User } from 'next-auth'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  const user: User | undefined = session?.user

  if (!session || !session.user) {
    return Response.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }

  const userId = user?.id

  const { acceptMessages } = await request.json()

  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: Number(userId),
      },
      data: {
        isAcceptingMessages: acceptMessages,
      },
    })

    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: 'Failed to update user message status',
        },
        {
          status: 401,
        }
      )
    }

    return Response.json(
      {
        success: true,
        message: 'User message status updated',
      },
      {
        status: 200,
      }
    )
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: 'Failed to update user message status',
      },
      {
        status: 500,
      }
    )
  }
}

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
    const foundUser = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
    })

    if (!foundUser) {
      return Response.json(
        {
          success: false,
          message: 'Failed to update user message status',
        },
        {
          status: 401,
        }
      )
    }

    return Response.json(
      {
        success: true,
        isAcceptingMessages: foundUser.isAcceptingMessages,
        message: 'User message status updated',
        data: {
          acceptMessages: foundUser.isAcceptingMessages,
        },
      },
      {
        status: 200,
      }
    )
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: 'Failed to update user message status',
      },
      {
        status: 500,
      }
    )
  }
}
