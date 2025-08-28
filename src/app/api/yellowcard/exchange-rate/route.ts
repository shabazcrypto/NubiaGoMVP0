import { yellowCardAPI } from '@/lib/api/yellowcard.api'

export async function GET(request: Request) {
  return yellowCardAPI.getExchangeRate(request as any)
}
