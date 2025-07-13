import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

export interface AdminPayload {
  adminId: string
  email: string
  name: string
}

export function verifyAdminToken(request: NextRequest): AdminPayload | null {
  try {
    const token = request.cookies.get('admin-token')?.value

    if (!token) {
      return null
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as AdminPayload
    return payload
  } catch (error) {
    console.error('Error verifying admin token:', error)
    return null
  }
}

export function requireAdmin(request: NextRequest): AdminPayload {
  const admin = verifyAdminToken(request)
  
  if (!admin) {
    throw new Error('Unauthorized: Admin access required')
  }
  
  return admin
}
