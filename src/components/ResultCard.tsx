import { ShieldCheck, ShieldAlert, ShieldX, Copy, Share2 } from 'lucide-react'
import classNames from 'classnames'

type Verdict = 'SAFE' | 'SUSPICIOUS' | 'SCAM' | 'TRUSTWORTHY' | 'QUESTIONABLE' | 'LIKELY_FAKE'
interface Props { result: { verdict: Verdict; confidence: number; explanation: string; signals: string[]; rawText?: string } }

const label: Record<Verdict,string> = {
  SAFE:'Safe', TRUSTWORTHY:'Trustworthy', SUSPICIOUS:'Suspicious', QUESTIONABLE:'Questionable', SCAM:'Likely scam', LIKELY_FAKE:'Likely fake'
}
const tone = (v: Verdict) => {
  if (v==='SAFE' || v==='TRUSTWORTHY') return { bg:'var(--verdict-safe-bg)', border:'var(--verdict-safe-border)', color:'var(--verdict-safe)', Icon: ShieldCheck }
  if (v==='SCAM' || v==='LIKELY_FAKE') return { bg:'var(--verdict-scam-bg)', border:'var(--verdict-scam-border)', color:'var(--verdict-scam)', Icon: ShieldX }
  return { bg:'var(--verdict-suspicious-bg)', border:'var(--verdict-suspicious-border)', color:'var(--verdict-suspicious)', Icon: ShieldAlert }
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
    <div style={{ background:'#FFFFFF', border:'1px solid #E2E8F0', borderRadius: 12, overflow:'hidden' }}>
      {/* Header — verdict is primary */}
      <div style={{ padding:'20px 20px 16px', borderBottom:'1px solid #F1F5F9' }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap: 16, flexWrap:'wrap' }}>
          <div style={{ display:'flex', gap: 12, alignItems:'center' }}>
            <span style={{ width: 36, height: 36, borderRadius: 8, display:'inline-flex', alignItems:'center', justifyContent:'center', background: t.bg, border:`1px solid ${t.border}`, color: t.color }}>
              <t.Icon size={18} strokeWidth={2} />
            </span>
            <div>
              <div style={{ fontSize: 11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'#64748B' }}>Analysis complete</div>
              <div style={{ fontSize: 22, fontWeight: 750, letterSpacing:'-0.02em', color:'#0F172A', lineHeight:1.15 }}>{label[result.verdict]}</div>
            </div>
          </div>
          <div style={{ display:'flex', gap: 8 }}>
            <button onClick={copy} aria-label="Copy result" style={{ width: 36, height: 36, borderRadius: 8, border:'1px solid #E2E8F0', background:'#FFFFFF', display:'inline-flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><Copy size={16} color="#475569" /></button>
            <button onClick={share} aria-label="Share result" style={{ width: 36, height: 36, borderRadius: 8, border:'1px solid #E2E8F0', background:'#FFFFFF', display:'inline-flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><Share2 size={16} color="#475569" /></button>
          </div>
        </div>

        {/* Confidence — secondary, monospace */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight:600, color:'#475569' }}>Confidence</span>
            <span style={{ fontFamily:'var(--font-mono)', fontSize: 13, fontWeight:600, color:'#0F172A' }}>{pct}%</span>
          </div>
          <div style={{ height: 8, background:'#F1F5F9', borderRadius: 9999, overflow:'hidden' }}>
            <div className={classNames('verdict-bar')} style={{ width:`${pct}%`, height:'100%', background: t.color, borderRadius: 9999, transition:'width 600ms var(--ease-default)' }} />
          </div>
          <div style={{ fontSize: 12, color:'#94A3B8', marginTop: 6 }}>
            {pct >= 80 ? 'High certainty' : pct >= 55 ? 'Moderate certainty' : 'Low certainty — verify with additional sources'}
          </div>
        </div>
      </div>

      {/* Explanation — body */}
      <div style={{ padding:'16px 20px' }}>
        <div style={{ fontSize: 12, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:'#64748B', marginBottom: 8 }}>What this means</div>
        <p style={{ margin:0, fontSize: 14, lineHeight:1.65, color:'#334155', whiteSpace:'pre-wrap' }}>{result.explanation}</p>
      </div>

      {/* Signals — tertiary, divider list */}
      {result.signals?.length > 0 && (
        <div style={{ padding:'0 20px 16px' }}>
          <div style={{ fontSize: 12, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:'#64748B', marginBottom: 8 }}>Why this result</div>
          <div style={{ border:'1px solid #E2E8F0', borderRadius: 8, overflow:'hidden' }}>
            {result.signals.slice(0,8).map((s,i) => (
              <div key={i} style={{ padding:'10px 12px', display:'flex', gap: 10, alignItems:'flex-start', background: i%2===0 ? '#FFFFFF' : '#F8FAFC', borderTop: i===0 ? 'none' : '1px solid #F1F5F9' }}>
                <span style={{ width:6, height:6, borderRadius:9999, background: t.color, marginTop: 7, flexShrink:0 }} />
                <span style={{ fontSize: 13, lineHeight:1.5, color:'#334155' }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding:'12px 20px', background:'#F8FAFC', borderTop:'1px solid #E2E8F0', display:'flex', justifyContent:'space-between', alignItems:'center', gap: 12, flexWrap:'wrap' }}>
        <span style={{ fontSize: 12, color:'#94A3B8' }}>Always verify from multiple sources.</span>
        <span style={{ fontSize: 11, color:'#94A3B8', fontFamily:'var(--font-mono)' }}>ID {String(Date.now()).slice(-6)} • {new Date().toLocaleDateString()}</span>
      </div>
    </div>
  )
}
