import { Container, Row, Col } from 'react-bootstrap'
import { ShieldCheck, ArrowRight, Lock, Globe, Zap, Brain } from 'lucide-react'
import Button from '../components/ui/Button'

const HomePage = () => {
  return (
    <div style={{ background:'#F8FAFC' }}>
      <section style={{ background:'#FFFFFF', borderBottom:'1px solid #E2E8F0', minHeight:'calc(100vh - 57px)', display:'flex', alignItems:'center', overflow:'hidden' }}>
        <Container fluid style={{ maxWidth: 1440, paddingLeft: 24, paddingRight: 24, paddingTop: 40, paddingBottom: 40 }}>
          <Row className="align-items-center" style={{ rowGap: 40, width:'100%', margin: 0 }}>
            <Col lg={6} style={{ paddingRight: 32, paddingTop: 16, paddingBottom: 16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom: 20 }}>
                <span style={{ width: 24, height:2, background:'#2563EB', borderRadius:1, display:'inline-block' }} />
                <span style={{ fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', color:'#64748B', fontWeight:600 }}>Independent • Private • No account</span>
              </div>
              <h1 style={{ fontSize: 'clamp(44px, 5.8vw, 64px)', fontWeight: 800, lineHeight: 0.9, letterSpacing:'-0.04em', color:'#0F172A', margin: 0 }}>
                Verify what you <span style={{ color:'#2563EB' }}>receive</span> before you act.
              </h1>
              <p style={{ fontSize: 19, color:'#475569', lineHeight:1.65, marginTop: 20, maxWidth: 560, fontWeight: 400 }}>
                Paste a message, link or article. Get a structured verdict with confidence, explanation and signals — private by design.
              </p>
              <div style={{ display:'flex', gap: 12, marginTop: 32, flexWrap:'wrap', alignItems:'center' }}>
                <Button to="/analyzer" variant="primary" icon={<ArrowRight size={16} />}>Start verifying</Button>
                <Button to="/features" variant="secondary">How it works</Button>
              </div>
              <div style={{ display:'flex', gap: 20, marginTop: 28, fontSize: 13, color:'#64748B', flexWrap:'wrap', borderTop:'1px solid #F1F5F9', paddingTop: 16 }}>
                <span style={{ display:'inline-flex', gap:6, alignItems:'center', fontWeight:500 }}><ShieldCheck size={14} color="#64748B" /> No data stored</span>
                <span style={{ display:'inline-flex', gap:6, alignItems:'center', fontWeight:500 }}><Lock size={14} color="#64748B" /> Privacy-first</span>
                <span style={{ display:'inline-flex', gap:6, alignItems:'center', fontWeight:500 }}><Zap size={14} color="#64748B" /> Seconds</span>
              </div>
            </Col>
            <Col lg={6} style={{ paddingLeft: 16, paddingRight: 0, display:'flex', justifyContent:'flex-end' }}>
              <div style={{ background:'#000', border:'1px solid #0F172A', borderRadius: 16, overflow:'hidden', position:'relative', boxShadow:'0 20px 56px rgba(15,23,42,0.16)', width:'100%', maxWidth: 720 }}>
                <video
                  src="/Vid/truth.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls={false}
                  disablePictureInPicture
                  style={{ width:'100%', height: 460, objectFit:'cover', display:'block' }}
                />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section style={{ padding:'88px 0 80px', background:'#F8FAFC' }}>
        <Container style={{ maxWidth: 1280 }}>
          <div style={{ maxWidth: 720, margin:'0 auto 40px', textAlign:'center' }}>
            <h2 style={{ fontSize: 26, fontWeight:700, letterSpacing:'-0.02em', color:'#0F172A', margin:0 }}>Built for fast, calm decisions</h2>
            <p style={{ fontSize: 15, color:'#64748B', margin:'12px auto 0', maxWidth: 560, lineHeight:1.6 }}>Each check returns the same distinct structure — designed for scanning, not marketing copy.</p>
          </div>
          <Row style={{ rowGap: 28 }}>
            {[
              { icon: <Brain size={18} />, title:'Pattern-aware check', desc:'Focused checks for phishing, scam and misinformation signals.' },
              { icon: <Zap size={18} />, title:'Structured result', desc:'Verdict, confidence, explanation and supporting signals in one view.' },
              { icon: <Lock size={18} />, title:'Private by default', desc:'No account. Content is validated, analyzed and discarded.' },
              { icon: <Globe size={18} />, title:'Multi-context', desc:'Message, link, article or document — same workspace, tailored prompts.' },
            ].map(f => (
              <Col key={f.title} md={6} lg={3}>
                <div style={{ background:'#FFFFFF', border:'1px solid #E2E8F0', borderRadius: 12, padding: 24, height:'100%' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background:'#F8FAFC', border:'1px solid #E2E8F0', display:'inline-flex', alignItems:'center', justifyContent:'center', color:'#0F172A', marginBottom: 14 }}>{f.icon}</div>
                  <div style={{ fontSize: 15, fontWeight:650, color:'#0F172A', marginBottom: 8, lineHeight:1.3 }}>{f.title}</div>
                  <div style={{ fontSize: 14, color:'#475569', lineHeight:1.65 }}>{f.desc}</div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section style={{ background:'#FFFFFF', borderTop:'1px solid #E2E8F0', borderBottom:'1px solid #E2E8F0' }}>
        <Container style={{ maxWidth: 720, paddingTop: 40, paddingBottom: 40, textAlign:'center' }}>
          <h2 style={{ fontSize: 22, fontWeight:700, letterSpacing:'-0.02em', color:'#0F172A', margin:0 }}>Start with what you received</h2>
          <p style={{ fontSize: 14, color:'#64748B', margin:'8px 0 16px' }}>No setup. No tracking. Just verification.</p>
          <Button to="/analyzer" variant="primary">Open analyzer</Button>
        </Container>
      </section>
    </div>
  )
}
export default HomePage
