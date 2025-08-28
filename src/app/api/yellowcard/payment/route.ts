import { yellowCardAPI } from '@/lib/api/yellowcard.api'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  return yellowCardAPI.initiatePayment(request)
}

export async function GET(request: NextRequest) {
  return yellowCardAPI.getPaymentStatus(request)
}
