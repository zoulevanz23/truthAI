import { ShieldCheck, ArrowRight, Lock, Globe, Zap, Brain } from 'lucide-react'
import Button from '../components/ui/Button'

const HomePage = () => {
  return (
    <div className="bg-slate-50">
      <section className="bg-white border-b border-slate-200 min-h-[calc(100vh-57px)] flex items-center overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 py-10 w-full">
          <div className="flex items-center gap-10 flex-wrap lg:flex-nowrap">
            <div className="flex-1 min-w-0 lg:pr-8 py-4">
              <div className="flex items-center gap-2.5 mb-5">
                <span className="w-6 h-0.5 bg-blue-600 rounded" />
                <span className="font-mono text-[11px] tracking-widest uppercase text-slate-500 font-semibold">Independent • Private • No account</span>
              </div>
              <h1 className="text-[clamp(44px,5.8vw,64px)] font-extrabold leading-[0.9] tracking-tight text-slate-900 m-0">
                Verify what you <span className="text-blue-600">receive</span> before you act.
              </h1>
              <p className="text-[19px] text-slate-600 leading-relaxed mt-5 max-w-[560px] font-normal">
                Paste a message, link or article. Get a structured verdict with confidence, explanation and signals — private by design.
              </p>
              <div className="flex gap-3 mt-8 flex-wrap items-center">
                <Button to="/analyzer" variant="primary" icon={<ArrowRight size={16} />}>Start verifying</Button>
                <Button to="/features" variant="secondary">How it works</Button>
              </div>
              <div className="flex gap-5 mt-7 text-sm text-slate-500 flex-wrap border-t border-slate-100 pt-4">
                <span className="inline-flex gap-1.5 items-center font-medium"><ShieldCheck size={14} className="text-slate-500" /> No data stored</span>
                <span className="inline-flex gap-1.5 items-center font-medium"><Lock size={14} className="text-slate-500" /> Privacy-first</span>
                <span className="inline-flex gap-1.5 items-center font-medium"><Zap size={14} className="text-slate-500" /> Seconds</span>
              </div>
            </div>
            <div className="flex-1 min-w-0 lg:pl-4 flex justify-end">
              <div className="bg-black border border-slate-900 rounded-2xl overflow-hidden relative shadow-xl w-full max-w-[720px]">
                <video
                  src="/Vid/truth.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls={false}
                  disablePictureInPicture
                  className="w-full h-[460px] object-cover block"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-[88px_0_80px] bg-slate-50">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="max-w-[720px] mx-auto mb-10 text-center">
            <h2 className="text-[26px] font-bold tracking-tight text-slate-900 m-0">Built for fast, calm decisions</h2>
            <p className="text-[15px] text-slate-500 mt-3 mx-auto max-w-[560px] leading-relaxed">Each check returns the same distinct structure — designed for scanning, not marketing copy.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
            {[
              { icon: <Brain size={18} />, title:'Pattern-aware check', desc:'Focused checks for phishing, scam and misinformation signals.' },
              { icon: <Zap size={18} />, title:'Structured result', desc:'Verdict, confidence, explanation and supporting signals in one view.' },
              { icon: <Lock size={18} />, title:'Private by default', desc:'No account. Content is validated, analyzed and discarded.' },
              { icon: <Globe size={18} />, title:'Multi-context', desc:'Message, link, article or document — same workspace, tailored prompts.' },
            ].map(f => (
              <div key={f.title} className="bg-white border border-slate-200 rounded-xl p-6 h-full">
                <div className="w-11 h-11 rounded-lg bg-slate-50 border border-slate-200 inline-flex items-center justify-center text-slate-900 mb-3.5">{f.icon}</div>
                <div className="text-[15px] font-bold text-slate-900 mb-2 leading-tight">{f.title}</div>
                <div className="text-sm text-slate-600 leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white border-t border-slate-200 border-b border-slate-200">
        <div className="max-w-[720px] mx-auto px-6 py-10 text-center">
          <h2 className="text-[22px] font-bold tracking-tight text-slate-900 m-0">Start with what you received</h2>
          <p className="text-sm text-slate-500 mt-2 mb-4">No setup. No tracking. Just verification.</p>
          <Button to="/analyzer" variant="primary">Open analyzer</Button>
        </div>
      </section>
    </div>
  )
}
export default HomePage
