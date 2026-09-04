import { ShieldCheck, Lock, FileText, Cpu } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="bg-slate-50">
      {/* Editorial header — not hero gradient */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-[1120px] mx-auto px-6 py-[72px_48px]">
          <div className="max-w-[720px]">
            <div className="text-[11px] font-bold tracking-widest uppercase text-slate-500 mb-3">About</div>
            <h1 className="text-[clamp(28px,4vw,38px)] font-extrabold leading-tight tracking-tight text-slate-900 m-0">
              Clear verification for everyday decisions.
            </h1>
            <p className="text-[17px] text-slate-600 leading-relaxed mt-3.5 max-w-[640px]">
              TruthCheck AI is a focused workspace to check a message, link or article and get a structured result — verdict, confidence, explanation and signals. No account. No history stored.
            </p>
            <div className="flex gap-2 mt-4 flex-wrap">
              {['Privacy-first', 'Heuristics + Gemini', 'No tracking'].map(t=> (
                <span key={t} className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Snapshot — editorial stats, restrained */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-[1120px] mx-auto px-6 py-7">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { k:'Input', v:'Message / Link / Article / Document', d:'Same workspace, tailored checks.' },
              { k:'Output', v:'Verdict + confidence + signals', d:'Designed for scanning in seconds.' },
              { k:'Data', v:'Analyzed and discarded', d:'Rate-limited and validated server-side.' },
            ].map(s=>(
              <div key={s.k} className="bg-white border border-slate-200 rounded-xl p-4 h-full">
                <div className="text-[11px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">{s.k}</div>
                <div className="text-sm font-bold text-slate-900 leading-relaxed">{s.v}</div>
                <div className="text-sm text-slate-500 mt-1">{s.d}</div>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* Approach — two column editorial, not corny mission */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-[1120px] mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 m-0 mb-3">How we approach it</h2>
              <div className="text-[14.5px] text-slate-700 leading-relaxed grid gap-3">
                <p className="m-0">Scams and misinformation share patterns — urgent language, credential requests, authority framing, reshaped URLs. We start with transparent heuristics for those signals, then use a structured Gemini check to explain the result.</p>
                <p className="m-0 text-slate-600">The goal is not to replace judgment, but to give you a fast second read you can act on.</p>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-2.5">What you get</div>
              <div className="grid gap-2.5">
                  {[
                    { icon:<ShieldCheck size={16}/>, title:'Verdict', desc:'Safe · Suspicious · Scam with calibrated confidence.' },
                    { icon:<FileText size={16}/>, title:'Explanation', desc:'Plain language why, not just a label.' },
                    { icon:<Cpu size={16}/>, title:'Signals', desc:'Checkable cues you can verify yourself.' },
                  ].map(r=>(
                  <div key={r.title} className="flex gap-3 items-start bg-white border border-slate-200 rounded-lg p-3">
                    <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 inline-flex items-center justify-center text-slate-900 flex-shrink-0">{r.icon}</span>
                      <div>
                      <div className="text-sm font-bold text-slate-900">{r.title}</div>
                      <div className="text-sm text-slate-500">{r.desc}</div>
                    </div>
                    </div>
                  ))}
                </div>
              </div>
          </div>
        </div>
      </section>

      {/* Principles — restrained, not vague */}
      <section className="bg-slate-50">
        <div className="max-w-[1120px] mx-auto px-6 py-12">
          <div className="max-w-[640px] mb-5">
            <h2 className="text-lg font-bold tracking-tight text-slate-900 m-0">Principles</h2>
            <p className="text-sm text-slate-500 mt-1.5 mb-0">Constraints we design around.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon:<Lock size={16}/>, t:'Privacy by default', d:'No login, no retention. Content is validated, checked and discarded. Client history is only in your browser.' },
              { icon:<ShieldCheck size={16}/>, t:'Explain, don\'t overclaim', d:'Confidence is shown as a range. Low certainty is explicit and asks you to cross-check.' },
              { icon:<FileText size={16}/>, t:'Built for speed', d:'Structured JSON and narrow prompts keep results fast, consistent and easy to scan.' },
            ].map(v=>(
              <div key={v.t} className="bg-white border border-slate-200 rounded-xl p-4.5 h-full">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 inline-flex items-center justify-center text-slate-900 mb-2.5">{v.icon}</div>
                <div className="text-sm font-bold text-slate-900 mb-1.5">{v.t}</div>
                <div className="text-sm text-slate-600 leading-relaxed">{v.d}</div>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* Builder — minimal */}
      <section className="bg-white border-t border-slate-200">
        <div className="max-w-[720px] mx-auto px-6 py-8 pb-10">
          <div className="flex gap-3.5 items-center bg-slate-50 border border-slate-200 rounded-xl p-4">
            <span className="w-9 h-9 rounded-lg bg-slate-900 inline-flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={18} color="#FFFFFF" />
            </span>
            <div>
              <div className="text-sm font-bold text-slate-900">Built by Josh Ivan Sartin — creator & developer</div>
              <div className="text-sm text-slate-500">Focused on practical, private verification. Feedback on false verdicts helps improve the checks.</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}