import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger'
}

export function Button({ className = '', variant = 'primary', ...props }: Props) {
  const base =
    'inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgba(7,27,58,0.22)] focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed'
  const styles =
    variant === 'primary'
      ? 'bg-[#071B3A] text-white hover:bg-[#0b2a5e]'
      : variant === 'danger'
        ? 'bg-rose-600 text-white hover:bg-rose-500'
        : 'bg-white text-[#0b1220] border border-[rgba(11,18,32,0.14)] hover:bg-[rgba(7,27,58,0.03)]'

  return <button className={`${base} ${styles} ${className}`} {...props} />
}

