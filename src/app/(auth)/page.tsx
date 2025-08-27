import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AuthRedirect({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const queryString = new URLSearchParams(searchParams as Record<string, string>).toString()
  const redirectUrl = queryString ? `/login?${queryString}` : '/login'
  
  redirect(redirectUrl)
}
