import { useState } from 'react'
import { Form, Alert } from 'react-bootstrap'
import { Mail, Link2, Newspaper, FileText, ArrowRight, ShieldCheck, AlertTriangle, XCircle } from 'lucide-react'
import { analyzeContent, type AnalysisResponse } from '../lib/api'
import ResultCard from './ResultCard'
import Loader from './Loader'
import { toast } from 'react-hot-toast'
import Button from './ui/Button'

type AnalysisType = 'message' | 'link' | 'news' | 'document'

const typeMeta: Record<AnalysisType, { label: string; icon: React.ReactNode; helper: string; placeholder: string }> = {
  message: { label: 'Message', icon: <Mail size={16} />, helper: 'Email, SMS, DM or chat transcript', placeholder: 'Paste the full message including sender and subject if available…\n\nExample: "Congratulations! You\'ve won $1,000,000! Click here to claim your prize now!"' },
  link:    { label: 'Link',    icon: <Link2 size={16} />, helper: 'URL, shortened link or QR destination', placeholder: 'Paste the URL to check…\n\nExample: https://suspicious-website.com/claim-prize' },
  news:    { label: 'Article', icon: <Newspaper size={16} />, helper: 'Headline, article or social post', placeholder: 'Paste the headline and key claims…\n\nExample: "Scientists Discover That Drinking Coffee Cures All Diseases"' },
  document:{ label: 'Document',icon: <FileText size={16} />, helper: 'Text file, report or exported chat', placeholder: 'Paste document text here…' },
}

const InputForm = () => {
  const [input, setInput] = useState('')
  const [type, setType] = useState<AnalysisType>('message')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResponse['result'] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const canSubmit = (input.trim().length > 0 || !!file) && !isLoading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setIsLoading(true); setError(null); setResult(null)
    try {
      let content = input
      if (file) {
        const ext = file.name.split('.').pop()?.toLowerCase()
        if (ext === 'txt') content = await file.text()
        else { setError('Only .txt is supported inline. For PDF/DOCX, copy the text into the field.'); setIsLoading(false); return }
      }
      const out = await analyzeContent(content, type as any)
      setResult(out)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Analysis failed.'
      setError(msg); try { toast.error(msg) } catch {}
    } finally { setIsLoading(false) }
  }

  const meta = typeMeta[type]
  const count = file ? (file.name + ' • ' + (file.size/1024).toFixed(1) + ' KB') : `${input.length} / 10,000`

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Workspace header — primary hierarchy */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform:'uppercase', color:'#64748B', marginBottom: 8 }}>Verification workspace</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing:'-0.02em', color:'#0F172A', margin: 0, lineHeight: 1.15 }}>What do you want to verify?</h1>
        <p style={{ fontSize: 15, color:'#475569', margin: '8px 0 0', maxWidth: 640 }}>Choose a content type, paste the full context, and run a structured check. No account required.</p>
      </div>

      {/* Type selector — restrained segmented control, no color pills */}
      <div role="tablist" aria-label="Analysis type" style={{ display:'flex', gap: 8, flexWrap:'wrap', marginBottom: 16 }}>
        {(Object.keys(typeMeta) as AnalysisType[]).map(k => {
          const active = k === type
          const m = typeMeta[k]
          return (
            <button
              key={k}
              role="tab"
              aria-selected={active}
              onClick={() => setType(k)}
              style={{
                display:'inline-flex', alignItems:'center', gap: 8,
                padding:'9px 14px', borderRadius: 8,
                border: active ? '1px solid #0F172A' : '1px solid #E2E8F0',
                background: active ? '#0F172A' : '#FFFFFF',
                color: active ? '#FFFFFF' : '#334155',
                fontSize: 13, fontWeight: 600, cursor:'pointer'
              }}
            >
              <span style={{ opacity: active ? 1 : 0.9, display:'inline-flex' }}>{m.icon}</span>
              {m.label}
            </button>
          )
        })}
      </div>
      <div style={{ fontSize: 13, color:'#64748B', marginBottom: 16, display:'flex', alignItems:'center', gap: 6 }}>
        <ShieldCheck size={14} /> {meta.helper}
      </div>

      {/* Workspace surface — single bordered surface, not giant card stack */}
      <div style={{ background:'#FFFFFF', border:'1px solid #E2E8F0', borderRadius: 12, overflow:'hidden' }}>
        <Form onSubmit={handleSubmit} style={{ margin: 0 }}>
          <div style={{ padding: 16, borderBottom:'1px solid #F1F5F9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color:'#0F172A' }}>Content</span>
            <span style={{ fontSize: 12, color:'#94A3B8', fontFamily:'var(--font-mono)' }}>{count}</span>
          </div>

          <div style={{ padding: 16 }}>
            <Form.Control
              as="textarea"
              rows={7}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={meta.placeholder}
              maxLength={10000}
              disabled={isLoading}
              style={{
                border:'1px solid #E2E8F0', borderRadius: 8, padding: 14,
                fontSize: type==='link' ? 13 : 14,
                fontFamily: type==='link' ? 'var(--font-mono)' : 'var(--font-sans)',
                background: '#FFFFFF', color:'#0F172A', boxShadow:'none'
              }}
            />
            {input.length > 9000 && (
              <div style={{ display:'flex', gap: 6, alignItems:'center', marginTop: 8, fontSize: 12, color:'#D97706' }}>
                <AlertTriangle size={14} /> Approaching limit
              </div>
            )}

            <div style={{ marginTop: 12, display:'flex', alignItems:'center', gap: 12, flexWrap:'wrap' }}>
              <label style={{ fontSize: 13, color:'#475569', display:'inline-flex', alignItems:'center', gap: 8, cursor:'pointer' }}>
                <input type="file" accept=".txt,.pdf,.docx" style={{ display:'none' }} onChange={e => { const f=e.target.files?.[0]; if(f) setFile(f) }} />
                <span style={{ border:'1px solid #E2E8F0', borderRadius: 8, padding:'7px 10px', background:'#F8FAFC', fontWeight: 600, fontSize: 12 }}>Attach file</span>
                <span style={{ fontSize: 12, color:'#94A3B8' }}>.txt preferred • PDF/DOCX: copy text</span>
              </label>
              {file && (
                <span style={{ fontSize: 12, color:'#334155', background:'#F1F5F9', border:'1px solid #E2E8F0', borderRadius: 9999, padding:'4px 8px', display:'inline-flex', gap: 6, alignItems:'center' }}>
                  {file.name} <button type="button" onClick={() => setFile(null)} style={{ border:'none', background:'transparent', color:'#64748B', cursor:'pointer', padding:0, lineHeight:1 }}><XCircle size={14} /></button>
                </span>
              )}
            </div>
          </div>

          <div style={{ padding:'12px 16px', background:'#F8FAFC', borderTop:'1px solid #E2E8F0', display:'flex', justifyContent:'flex-end', alignItems:'center', gap: 12 }}>
            <span style={{ fontSize: 12, color:'#94A3B8' }}>{isLoading ? 'Verifying…' : 'No data is stored'}</span>
            <Button type="submit" disabled={!canSubmit} variant={canSubmit ? 'primary' : 'secondary'} icon={<ArrowRight size={16} />}>
              {isLoading ? 'Analyzing…' : 'Analyze'}
            </Button>
          </div>
        </Form>
      </div>

      {/* States — restrained */}
      {error && (
        <Alert variant="danger" style={{ marginTop: 16, background:'#FEF2F2', border:'1px solid #FECACA', color:'#7F1D1D', borderRadius: 8, padding: 12, display:'flex', gap: 8, alignItems:'center' }}>
          <XCircle size={16} /> {error}
        </Alert>
      )}
      {isLoading && (
        <div style={{ marginTop: 16, background:'#FFFFFF', border:'1px solid #E2E8F0', borderRadius: 12, padding: 16, display:'flex', alignItems:'center', gap: 12 }}>
          <Loader />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color:'#0F172A' }}>Running verification</div>
            <div style={{ fontSize: 12, color:'#64748B' }}>Cross-checking patterns and signals…</div>
          </div>
        </div>
      )}
      {result && (
        <div style={{ marginTop: 16 }}>
          <ResultCard result={result} />
        </div>
      )}

      {/* Secondary info — tertiary hierarchy, not competing card */}
      <div style={{ marginTop: 24, paddingTop: 16, borderTop:'1px solid #F1F5F9' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color:'#475569', marginBottom: 8 }}>How to get a better result</div>
        <ul style={{ margin:0, paddingLeft: 18, color:'#64748B', fontSize: 13, lineHeight: 1.6 }}>
          <li>Include the complete message, sender and subject for emails.</li>
          <li>For links, paste the exact URL. Shortened links are automatically expanded.</li>
          <li>For articles, include headline and the specific claim to check.</li>
        </ul>
      </div>
    </div>
  )
}
export default InputForm
