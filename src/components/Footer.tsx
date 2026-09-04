import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
export default function Footer(){
  return (
    <footer className="bg-white border-t border-slate-200 py-6">
      <div className="max-w-[1120px] mx-auto px-4 flex justify-between gap-4 flex-wrap items-center">
        <div className="flex gap-2.5 items-center text-sm text-slate-500">
          <span className="inline-flex items-center justify-center w-5.5 h-5.5 bg-slate-900 rounded-md">
            <ShieldCheck size={12} color="#FFF" />
          </span>
          <span className="font-semibold text-slate-900">TruthCheck AI</span>
          <span>© {new Date().getFullYear()} • Privacy-first verification</span>
        </div>
        <div className="flex gap-3.5 text-sm">
          <Link to="/features" className="text-slate-600 hover:text-slate-900 no-underline">How it works</Link>
          <Link to="/analyzer" className="text-slate-600 hover:text-slate-900 no-underline">Analyzer</Link>
          <Link to="/about" className="text-slate-600 hover:text-slate-900 no-underline">About</Link>
        </div>
      </div>
    </footer>
  )
}
