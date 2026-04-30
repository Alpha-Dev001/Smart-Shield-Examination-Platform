import type { InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: Props) {
  return (
    <label className="block">
      {label ? (
        <span className="mb-1 block text-sm font-medium text-[#1b2a44]">{label}</span>
      ) : null}
      <input
        className={`w-full rounded-xl border border-[rgba(11,18,32,0.16)] bg-white px-4 py-2.5 text-sm outline-none shadow-sm transition focus:border-[rgba(7,27,58,0.35)] focus:ring-2 focus:ring-[rgba(7,27,58,0.16)] ${className}`}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-rose-600">{error}</span> : null}
    </label>
  )
}

