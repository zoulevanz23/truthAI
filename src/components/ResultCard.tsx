import { ShieldCheck, ShieldAlert, ShieldX, Copy, Share2 } from 'lucide-react'
import cn from 'classnames'

type Verdict = 'SAFE' | 'SUSPICIOUS' | 'SCAM' | 'TRUSTWORTHY' | 'QUESTIONABLE' | 'LIKELY_FAKE'
interface Props { result: { verdict: Verdict; confidence: number; explanation: string; signals: string[]; rawText?: string } }

const label: Record<Verdict,string> = {
  SAFE:'Safe', TRUSTWORTHY:'Trustworthy', SUSPICIOUS:'Suspicious', QUESTIONABLE:'Questionable', SCAM:'Likely scam', LIKELY_FAKE:'Likely fake'
}
const tone = (v: Verdict) => {
  if (v==='SAFE' || v==='TRUSTWORTHY') return { bg:'bg-green-50', border:'border-green-200', color:'text-green-600', Icon: ShieldCheck }
  if (v==='SCAM' || v==='LIKELY_FAKE') return { bg:'bg-red-50', border:'border-red-200', color:'text-red-600', Icon: ShieldX }
  return { bg:'bg-amber-50', border:'border-amber-200', color:'text-amber-600', Icon: ShieldAlert }
}

export default function ResultCard({ result }: Props) {
  const t = tone(result.verdict)
  const pct = Math.max(0, Math.min(100, Math.round(result.confidence)))

  const copy = async () => {
    const text = `Verdict: ${label[result.verdict]} (${pct}%)\n\n${result.explanation}\n\nSignals:\n- ${result.signals.join('\n- ')}`
    try { await navigator.clipboard.writeText(text) } catch {}
  }
  const share = async () => {
    const text = `Verdict: ${label[result.verdict]} — ${result.explanation.slice(0,120)}`
    try {
      if ((navigator as any).share) await (navigator as any).share({ title:'TruthCheck result', text })
      else await navigator.clipboard.writeText(text)
    } catch {}
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Header — verdict is primary */}
      <div className="px-5 py-5 pb-4 border-b border-slate-100">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex gap-3 items-center">
            <span className={`w-9 h-9 rounded-lg inline-flex items-center justify-center ${t.bg} border ${t.border} ${t.color}`}>
              <t.Icon size={18} strokeWidth={2} />
            </span>
            <div>
              <div className="text-[11px] font-bold tracking-widest uppercase text-slate-500">Analysis complete</div>
              <div className="text-[22px] font-extrabold tracking-tight text-slate-900 leading-tight">{label[result.verdict]}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={copy} aria-label="Copy result" className="w-9 h-9 rounded-lg border border-slate-200 bg-white inline-flex items-center justify-center cursor-pointer hover:bg-slate-50"><Copy size={16} className="text-slate-600" /></button>
            <button onClick={share} aria-label="Share result" className="w-9 h-9 rounded-lg border border-slate-200 bg-white inline-flex items-center justify-center cursor-pointer hover:bg-slate-50"><Share2 size={16} className="text-slate-600" /></button>
          </div>
        </div>

        {/* Confidence — secondary, monospace */}
        <div className="mt-4">
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-xs font-semibold text-slate-600">Confidence</span>
            <span className="font-mono text-sm font-semibold text-slate-900">{pct}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className={cn('h-full rounded-full transition-all duration-600', t.color)} style={{ width:`${pct}%` }} />
          </div>
          <div className="text-xs text-slate-400 mt-1.5">
            {pct >= 80 ? 'High certainty' : pct >= 55 ? 'Moderate certainty' : 'Low certainty — verify with additional sources'}
          </div>
        </div>
      </div>

      {/* Explanation — body */}
      <div className="px-5 py-4">
        <div className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-2">What this means</div>
        <p className="m-0 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{result.explanation}</p>
      </div>

      {/* Signals — tertiary, divider list */}
      {result.signals?.length > 0 && (
        <div className="px-5 pb-4">
          <div className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-2">Why this result</div>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            {result.signals.slice(0,8).map((s,i) => (
              <div key={i} className={`px-3 py-2.5 flex gap-2.5 items-start ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'} ${i !== 0 ? 'border-t border-slate-100' : ''}`}>
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${t.color === 'text-green-600' ? 'bg-green-600' : t.color === 'text-red-600' ? 'bg-red-600' : 'bg-amber-600'}`} />
                <span className="text-sm leading-relaxed text-slate-700">{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center gap-3 flex-wrap">
        <span className="text-xs text-slate-400">Always verify from multiple sources.</span>
        <span className="text-[11px] text-slate-400 font-mono">ID {String(Date.now()).slice(-6)} • {new Date().toLocaleDateString()}</span>
      </div>
    </div>
  )
}
