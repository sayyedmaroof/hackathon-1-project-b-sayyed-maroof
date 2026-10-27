import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { destroySession } from '@/lib/auth/session'

export async function POST() {
  await destroySession()
  revalidatePath('/', 'layout')
  redirect('/')
}
