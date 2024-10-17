import Link from "next/link"

export function Navigation() {
  return (
    <nav>
      <Link href="/feedback">Feedback Forms</Link>
      <Link href="/feedback/adhoc">Adhoc Feedback</Link>
    </nav>
  )
}
