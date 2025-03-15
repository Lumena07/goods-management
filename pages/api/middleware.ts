import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'

export type ApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
  session: any
) => Promise<void | any>

export const withErrorHandler = (handler: ApiHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Check authentication
      const session = await getServerSession(req, res, authOptions)
      
      // Execute the handler
      await handler(req, res, session)
    } catch (error) {
      // Send appropriate error response
      res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' 
          ? error instanceof Error ? error.message : 'Unknown error'
          : 'An unexpected error occurred'
      })
    }
  }
} 