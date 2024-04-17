import prisma from '@secret-hub/db/client'
import { NextRequest } from 'next/server'
import { messageSchema } from '../../schemas/messageSchema'

export async function POST(request: NextRequest) {
  const body = await request.json()

  const messageValidate = messageSchema.safeParse(body)

  if (!messageValidate.success) {
    return Response.json(
      { success: false, message: messageValidate.error.format() },
      { status: 400 }
    )
  }

  const { username, content } = messageValidate.data

  try {
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    })

    if (!user) {
      return Response.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    if (!user.isAcceptingMessages) {
      return Response.json(
        { success: false, message: 'User is not accepting messages' },
        { status: 403 }
      )
    }

    const message = { content, createdAt: new Date().toISOString() }

    await prisma.message.create({
      data: {
        content: message.content,
        createdAt: message.createdAt,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    })

    return Response.json(
      { success: true, message: 'Message sent successfully' },
      {
        status: 201,
      }
    )
  } catch (error) {
    return Response.json(
      { success: false, message: 'Something went wrong' },
      { status: 500 }
    )
  }
}
