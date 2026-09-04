import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShieldCheck, Menu, X } from 'lucide-react'
import { checkServerHealth } from '../lib/api'
import Button from './ui/Button'

const Header = () => {
  const [expanded, setExpanded] = useState(false)
  const location = useLocation()
  const [serverHealthy, setServerHealthy] = useState<boolean | null>(null)

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const ok = await checkServerHealth()
        if (isMounted) setServerHealthy(ok)
      } catch {
        if (isMounted) setServerHealthy(false)
      }
    })()
    return () => { isMounted = false }
  }, [])

  const isActive = (p: string) => location.pathname === p

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <div className="inline-flex items-center justify-center w-7 h-7 bg-slate-900 rounded-md">
              <ShieldCheck size={16} color="#FFFFFF" strokeWidth={2} />
            </div>
            <span className="text-slate-900 font-semibold">TruthCheck AI</span>
            <span className="text-xs font-semibold text-slate-500 border border-slate-200 rounded-full px-2 py-0.5 ml-1">BETA</span>
          </Link>

          <button
            className="lg:hidden p-2 rounded-md hover:bg-slate-100"
            onClick={() => setExpanded(!expanded)}
            aria-label="Toggle menu"
          >
            {expanded ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className={`${expanded ? 'flex' : 'hidden'} lg:flex lg:items-center lg:gap-3 absolute lg:static top-14 left-0 right-0 bg-white lg:bg-transparent border-t lg:border-t-0 border-slate-200 lg:border-0 p-4 lg:p-0 flex-col lg:flex-row shadow-lg lg:shadow-none`}>
            <Link
              to="/"
              className={`text-sm font-medium no-underline ${isActive('/') ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
              onClick={() => setExpanded(false)}
            >
              Verify
            </Link>
            <Link
              to="/features"
              className={`text-sm font-medium no-underline ${isActive('/features') ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
              onClick={() => setExpanded(false)}
            >
              How it works
            </Link>
            <Link
              to="/about"
              className={`text-sm font-medium no-underline ${isActive('/about') ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
              onClick={() => setExpanded(false)}
            >
              About
            </Link>
            <div className="hidden lg:block w-px h-5 bg-slate-200 mx-3" />
            <div className="flex items-center gap-2 text-xs font-medium font-mono" style={{ color: serverHealthy ? '#059669' : serverHealthy === false ? '#DC2626' : '#64748B' }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: serverHealthy ? '#059669' : serverHealthy === false ? '#DC2626' : '#CBD5E1' }} />
              {serverHealthy == null ? 'Checking' : serverHealthy ? 'Operational' : 'Offline'}
            </div>
            <Button to="/analyzer" variant="primary" onClick={() => setExpanded(false)} className="px-4 py-2.5 text-xs ml-2">
              Open analyzer
            </Button>
          </div>
        </div>
      </nav>
    </header>
  )
}
export default Header
