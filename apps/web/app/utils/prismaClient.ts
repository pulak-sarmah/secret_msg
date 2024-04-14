import { PrismaClient } from '@secret-hub/db/client'

const prisma = new PrismaClient({
  log: ['query'],
})
export default prisma
