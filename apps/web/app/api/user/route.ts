import { NextResponse } from 'next/server'
import prisma from '../../utils/prismaClient'

export const GET = async () => {
  try {
    await prisma.user.create({
      data: {
        email: 'asdaasss',
        name: 'adsads',
      },
    })
    return NextResponse.json({
      message: 'hi there',
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 500,
        body: 'error',
      },
      { status: 400 }
    )
  }
}
