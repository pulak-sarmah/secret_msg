import { PrismaAdapter } from '@next-auth/prisma-adapter'
import prisma from '@secret-hub/db/client'
import { NextAuthOptions } from 'next-auth'
import bcrypt from 'bcryptjs'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'jsmith@gmail.com',
        },
        password: {
          label: 'Password',
          type: 'password',
          placeholder: 'password',
        },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials.password) return null

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          })
          if (!user) {
            throw new Error('User not found with this email or username.')
          }

          if (!user.isVerified) {
            throw new Error('User is not verified.please verify your account.')
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          )
          if (isPasswordCorrect) {
            return {
              ...user,
              id: String(user.id),
            }
          } else {
            throw new Error('Password is incorrect.')
          }
        } catch (error) {
          throw new Error(String(error))
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: '/sign-in',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id?.toString()
        token.isVerified = user.isVerified
        token.isAcceptingMessages = user.isAcceptingMessages
        token.username = user.username
      }

      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.isVerified = token.isVerified
        session.user.isAcceptingMessages = token.isAcceptingMessages
        session.user.username = token.username
      }
      return session
    },
  },
}

export default authOptions
