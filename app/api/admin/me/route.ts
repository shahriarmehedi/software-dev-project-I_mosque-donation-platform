import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const admin = requireAdmin(request)
    
    return NextResponse.json({
      success: true,
      user: {
        id: admin.adminId,
        email: admin.email,
        name: admin.name
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
