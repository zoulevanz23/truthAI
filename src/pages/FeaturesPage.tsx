import { ShieldCheck, Search, Link2, Mail, Newspaper } from 'lucide-react'
import Button from '../components/ui/Button'

export default function FeaturesPage() {
  return (
    <div className="bg-slate-50">
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-[1120px] mx-auto px-6 py-[72px_48px]">
          <div className="max-w-[720px]">
            <div className="text-[11px] font-bold tracking-widest uppercase text-slate-500 mb-3">How it works</div>
            <h1 className="text-[clamp(28px,4vw,38px)] font-extrabold leading-tight tracking-tight text-slate-900 m-0">
              A short check with a clear output.
            </h1>
            <p className="text-[17px] text-slate-600 leading-relaxed mt-3.5 max-w-[640px]">
              Paste what you received. Get the same structure every time — verdict, confidence, explanation and signals. No chat, no extra steps.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-[1120px] mx-auto px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { n:'01', t:'Choose a type', d:'Message, link, article or document. Each has a tailored check.' },
              { n:'02', t:'Add context', d:'Include the full text, sender or headline for a better read.' },
              { n:'03', t:'Get the result', d:'Same format every time, built for quick decisions.' },
            ].map(s=>(
              <div key={s.n} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-3 items-start">
                <span className="font-mono text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-1.5 py-1 leading-none">{s.n}</span>
                <div>
                  <div className="text-sm font-bold text-slate-900 mb-1">{s.t}</div>
                  <div className="text-sm text-slate-600 leading-relaxed">{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-slate-200">
        <div className="max-w-[1120px] mx-auto px-6 py-12 pb-8">
          <h2 className="text-lg font-bold tracking-tight text-slate-900 m-0 mb-4">What gets checked</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon:<Mail size={16}/>, title:'Message', desc:'Urgent language, credential requests and sender mismatches.' },
              { icon:<Link2 size={16}/>, title:'Link', desc:'URL shape, redirects and signals before you click.' },
              { icon:<Newspaper size={16}/>, title:'Article', desc:'Claim framing, sourcing and language that pressures a quick share.' },
            ].map(c=>(
              <div key={c.title} className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 h-full">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 inline-flex items-center justify-center text-slate-900 mb-2.5">{c.icon}</div>
                <div className="text-sm font-bold text-slate-900 mb-1.5">{c.title}</div>
                <div className="text-sm text-slate-600 leading-relaxed">{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="max-w-[1120px] mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex gap-2.5 items-center mb-2.5">
                <span className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 inline-flex items-center justify-center text-slate-900"><ShieldCheck size={16}/></span>
                <div className="text-sm font-bold text-slate-900">Private by default</div>
              </div>
              <ul className="m-0 pl-4.5 text-sm text-slate-600 leading-[1.7]">
                <li>No account, no storage — content is discarded.</li>
                <li>Rate limits and basic validation on the server.</li>
                <li>History, if shown, lives only in your browser.</li>
              </ul>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex gap-2.5 items-center mb-2.5">
                <span className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 inline-flex items-center justify-center text-slate-900"><Search size={16}/></span>
                <div className="text-sm font-bold text-slate-900">Consistent output</div>
              </div>
              <ul className="m-0 pl-4.5 text-sm text-slate-600 leading-[1.7]">
                <li>Verdict with calibrated confidence.</li>
                <li>Plain-language explanation.</li>
                <li>Signals you can check yourself.</li>
              </ul>
            </div>
          </div>
          <div className="text-center mt-7">
            <Button to="/analyzer" variant="primary">Try it now</Button>
          </div>
        </div>
      </section>
    </div>
  )
}
