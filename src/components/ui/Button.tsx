import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

type Variant = 'primary' | 'secondary' | 'ghost'
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  to?: string
  icon?: React.ReactNode
  disabled?: boolean
}

const styles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: '#1D4ED8',
    color: '#FFFFFF',
    border: '1px solid #1D4ED8',
    boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
  },
  secondary: {
    background: '#FFFFFF',
    color: '#0F172A',
    border: '1px solid #E2E8F0',
    boxShadow: 'none',
  },
  ghost: {
    background: 'transparent',
    color: '#334155',
    border: '1px solid transparent',
    boxShadow: 'none',
  },
}

export default function Button({ variant = 'primary', to, icon, children, style, disabled, ...rest }: Props) {
  const base: React.CSSProperties = {
    borderRadius: 9999,
    padding: '11px 20px',
    fontWeight: 700,
    fontSize: 14,
    lineHeight: 1,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    ...styles[variant],
    ...(variant === 'primary' && disabled ? { background: '#F1F5F9', color: '#94A3B8', border: '1px solid #E2E8F0', boxShadow: 'none' } : {}),
    ...style,
  }

  const common = { style: base, ...rest } as any
  const btn = to && !disabled ? (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <span {...common} style={{ ...base, display: 'inline-flex' }}>
        {children}
        {icon}
      </span>
    </Link>
  ) : (
    <button disabled={disabled} {...common}>
      {children}
      {icon}
    </button>
  )

  return (
    <motion.span
      whileHover={disabled ? {} : { y: -1 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      style={{ display: 'inline-flex' }}
    >
      {btn}
    </motion.span>
  )
}
