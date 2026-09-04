import { useState } from 'react'
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
    <div className="max-w-[720px] mx-auto">
      {/* Workspace header — primary hierarchy */}
      <div className="mb-6">
        <div className="text-[11px] font-bold tracking-widest uppercase text-slate-500 mb-2">Verification workspace</div>
        <h1 className="text-[28px] font-bold tracking-tight text-slate-900 m-0 leading-tight">What do you want to verify?</h1>
        <p className="text-[15px] text-slate-600 mt-2 max-w-[640px]">Choose a content type, paste the full context, and run a structured check. No account required.</p>
      </div>

      {/* Type selector — restrained segmented control, no color pills */}
      <div role="tablist" aria-label="Analysis type" className="flex gap-2 flex-wrap mb-4">
        {(Object.keys(typeMeta) as AnalysisType[]).map(k => {
          const active = k === type
          const m = typeMeta[k]
          return (
            <button
              key={k}
              role="tab"
              aria-selected={active}
              onClick={() => setType(k)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-semibold cursor-pointer transition-colors ${
                active 
                  ? 'border-slate-900 bg-slate-900 text-white' 
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className={`inline-flex ${active ? 'opacity-100' : 'opacity-90'}`}>{m.icon}</span>
              {m.label}
            </button>
          )
        })}
      </div>
      <div className="text-sm text-slate-500 mb-4 flex items-center gap-1.5">
        <ShieldCheck size={14} /> {meta.helper}
      </div>

      {/* Workspace surface — single bordered surface, not giant card stack */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <form onSubmit={handleSubmit} className="m-0">
          <div className="px-4 py-4 border-b border-slate-100 flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-900">Content</span>
            <span className="text-xs text-slate-400 font-mono">{count}</span>
          </div>

          <div className="p-4">
            <textarea
              rows={7}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={meta.placeholder}
              maxLength={10000}
              disabled={isLoading}
              className={`w-full border border-slate-200 rounded-lg p-3.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                type === 'link' ? 'text-[13px] font-mono' : 'text-[14px]'
              }`}
            />
            {input.length > 9000 && (
              <div className="flex gap-1.5 items-center mt-2 text-xs text-amber-600">
                <AlertTriangle size={14} /> Approaching limit
              </div>
            )}

            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <label className="text-sm text-slate-600 inline-flex items-center gap-2 cursor-pointer">
                <input type="file" accept=".txt,.pdf,.docx" className="hidden" onChange={e => { const f=e.target.files?.[0]; if(f) setFile(f) }} />
                <span className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 font-semibold text-xs">Attach file</span>
                <span className="text-xs text-slate-400">.txt preferred • PDF/DOCX: copy text</span>
              </label>
              {file && (
                <span className="text-xs text-slate-700 bg-slate-100 border border-slate-200 rounded-full px-2 py-1 inline-flex gap-1.5 items-center">
                  {file.name} <button type="button" onClick={() => setFile(null)} className="border-none bg-transparent text-slate-500 cursor-pointer p-0 leading-none"><XCircle size={14} /></button>
                </span>
              )}
            </div>
          </div>

          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex justify-end items-center gap-3">
            <span className="text-xs text-slate-400">{isLoading ? 'Verifying…' : 'No data is stored'}</span>
            <Button type="submit" disabled={!canSubmit} variant={canSubmit ? 'primary' : 'secondary'} icon={<ArrowRight size={16} />}>
              {isLoading ? 'Analyzing…' : 'Analyze'}
            </Button>
          </div>
        </form>
      </div>

      {/* States — restrained */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-900 rounded-lg p-3 flex gap-2 items-center">
          <XCircle size={16} /> {error}
        </div>
      )}
      {isLoading && (
        <div className="mt-4 bg-white border border-slate-200 rounded-lg p-4 flex items-center gap-3">
          <Loader />
          <div>
            <div className="text-sm font-semibold text-slate-900">Running verification</div>
            <div className="text-xs text-slate-500">Cross-checking patterns and signals…</div>
          </div>
        </div>
      )}
      {result && (
        <div className="mt-4">
          <ResultCard result={result} />
        </div>
      )}

      {/* Secondary info — tertiary hierarchy, not competing card */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <div className="text-xs font-semibold text-slate-600 mb-2">How to get a better result</div>
        <ul className="m-0 pl-4.5 text-slate-500 text-sm leading-relaxed">
          <li>Include the complete message, sender and subject for emails.</li>
          <li>For links, paste the exact URL. Shortened links are automatically expanded.</li>
          <li>For articles, include headline and the specific claim to check.</li>
        </ul>
      </div>
    </div>
  )
}
export default InputForm
