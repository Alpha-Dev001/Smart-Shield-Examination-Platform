import type { ReactNode } from 'react'

export function StatCard({
  label,
  value,
  active = false,
  icon,
}: {
  label: string
  value: ReactNode
  active?: boolean
  icon?: ReactNode
}) {
  return (
    <div
      className={[
        'rounded-2xl border px-5 py-4 shadow-[0_10px_22px_rgba(7,27,58,0.06)] transition',
        active
          ? 'border-[rgba(7,27,58,0.55)] bg-[#071B3A] text-white'
          : 'border-[rgba(11,18,32,0.14)] bg-white text-[#0b1220]',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className={active ? 'text-xs text-white/75' : 'text-xs text-[#5b6474]'}>
            {label}
          </div>
          <div className="mt-1 text-3xl font-semibold leading-none">{value}</div>
        </div>
        {icon ? (
          <div className={active ? 'text-white/85' : 'text-[#071B3A]/70'}>{icon}</div>
        ) : null}
      </div>
    </div>
  )
}

