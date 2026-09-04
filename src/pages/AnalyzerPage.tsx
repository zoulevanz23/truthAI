import InputForm from '../components/InputForm'
import { ShieldCheck } from 'lucide-react'

const AnalyzerPage = () => {
  return (
    <div className="bg-slate-50 min-h-[calc(100vh-56px)]">
      <div className="max-w-[1120px] mx-auto px-6 py-12 pb-16">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
          <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-2 py-1 font-semibold">
            <ShieldCheck size={14} /> Privacy-first • No data stored
          </span>
          <span className="text-slate-300">•</span>
          <span>Results in seconds</span>
        </div>

        <InputForm />

        <div className="max-w-[720px] mx-auto mt-8 grid grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-1.5">How it works</div>
            <ol className="m-0 pl-4.5 text-sm text-slate-600 leading-relaxed">
              <li>Choose type and paste content</li>
              <li>We run heuristic and AI checks</li>
              <li>Get verdict, confidence and signals</li>
            </ol>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-1.5">Trust & privacy</div>
            <p className="m-0 text-sm text-slate-600 leading-relaxed">No login. Content is analyzed and discarded. Rate-limited and validated on the server. Always cross-check important decisions.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
export default AnalyzerPage
