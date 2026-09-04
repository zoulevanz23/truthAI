import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import cn from 'classnames'

type Variant = 'primary' | 'secondary' | 'ghost'
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  to?: string
  icon?: React.ReactNode
  disabled?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-blue-700 text-white border-blue-700 shadow-md hover:bg-blue-600',
  secondary: 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50',
  ghost: 'bg-transparent text-slate-600 border-transparent hover:text-slate-900',
}

export default function Button({ variant = 'primary', to, icon, children, className, disabled, ...rest }: Props) {
  const baseClasses = cn(
    'inline-flex items-center gap-2 px-5 py-3 font-bold text-sm leading-none rounded-full border transition-colors',
    variantClasses[variant],
    disabled && 'opacity-60 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200 shadow-none',
    className
  )

  const btn = to && !disabled ? (
    <Link to={to} className="no-underline">
      <span className={baseClasses}>
        {children}
        {icon}
      </span>
    </Link>
  ) : (
    <button disabled={disabled} className={baseClasses} {...rest}>
      {children}
      {icon}
    </button>
  )

  return (
    <motion.span
      whileHover={disabled ? {} : { y: -1 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className="inline-flex"
    >
      {btn}
    </motion.span>
  )
}
