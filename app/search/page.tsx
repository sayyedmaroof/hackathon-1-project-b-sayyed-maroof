import { redirect } from 'next/navigation'

/** Spend planning is the product. Flight search is no longer the entry point. */
export default function SearchRoute() {
  redirect('/')
}
