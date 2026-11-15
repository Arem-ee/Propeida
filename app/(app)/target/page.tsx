import { getTargetState } from '@/lib/actions/targets'
import TargetClient from '@/components/target/target-client'

export const metadata = { title: 'My target' }

export default async function TargetPage() {
  let initial
  try {
    initial = await getTargetState()
  } catch {
    initial = { schools: [], targetSchoolId: null, screening: null }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-[32px] font-semibold leading-tight text-black">
          My target
        </h1>
        <p className="mt-1.5 text-[15px] font-semibold text-ink-soft">
          You keep one school in sight, then you check its screening facts and your estimate
        </p>
      </div>
      <TargetClient initial={initial} />
    </div>
  )
}
