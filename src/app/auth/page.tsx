import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function AuthRedirect() {
  const headersList = headers()
  const referer = headersList.get('referer')
  
  // If coming from a specific page, redirect back after login
  const redirectParam = referer ? `?redirect=${encodeURIComponent(referer)}` : ''
  const loginUrl = `/login${redirectParam}`

  return redirect(loginUrl)
}