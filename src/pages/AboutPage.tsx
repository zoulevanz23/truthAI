import { Container, Row, Col } from 'react-bootstrap'
import { ShieldCheck, Lock, FileText, Cpu } from 'lucide-react'

export default function AboutPage() {
  return (
    <div style={{ background:'#F8FAFC' }}>
      {/* Editorial header — not hero gradient */}
      <section style={{ background:'#FFFFFF', borderBottom:'1px solid #E2E8F0' }}>
        <Container style={{ maxWidth: 1120, paddingTop: 72, paddingBottom: 48 }}>
          <div style={{ maxWidth: 720 }}>
            <div style={{ fontSize: 11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'#64748B', marginBottom: 12 }}>About</div>
            <h1 style={{ fontSize:'clamp(28px,4vw,38px)', fontWeight:750, lineHeight:1.05, letterSpacing:'-0.03em', color:'#0F172A', margin:0 }}>
              Clear verification for everyday decisions.
            </h1>
            <p style={{ fontSize:17, color:'#475569', lineHeight:1.65, marginTop:14, maxWidth: 640 }}>
              TruthCheck AI is a focused workspace to check a message, link or article and get a structured result — verdict, confidence, explanation and signals. No account. No history stored.
            </p>
            <div style={{ display:'flex', gap: 8, marginTop: 16, flexWrap:'wrap' }}>
              {['Privacy-first', 'Heuristics + Gemini', 'No tracking'].map(t=> (
                <span key={t} style={{ fontSize:12, fontWeight:600, color:'#334155', background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:9999, padding:'5px 10px' }}>{t}</span>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Snapshot — editorial stats, restrained */}
      <section style={{ background:'#F8FAFC', borderBottom:'1px solid #E2E8F0' }}>
        <Container style={{ maxWidth: 1120, padding:'28px 12px' }}>
          <Row style={{ rowGap: 16 }}>
            {[
              { k:'Input', v:'Message / Link / Article / Document', d:'Same workspace, tailored checks.' },
              { k:'Output', v:'Verdict + confidence + signals', d:'Designed for scanning in seconds.' },
              { k:'Data', v:'Analyzed and discarded', d:'Rate-limited and validated server-side.' },
            ].map(s=>(
              <Col key={s.k} md={4}>
                <div style={{ background:'#FFFFFF', border:'1px solid #E2E8F0', borderRadius:12, padding:16, height:'100%' }}>
                  <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:'#64748B', marginBottom:6 }}>{s.k}</div>
                  <div style={{ fontSize:14, fontWeight:650, color:'#0F172A', lineHeight:1.4 }}>{s.v}</div>
                  <div style={{ fontSize:13, color:'#64748B', marginTop:4 }}>{s.d}</div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Approach — two column editorial, not corny mission */}
      <section style={{ background:'#FFFFFF', borderBottom:'1px solid #E2E8F0' }}>
        <Container style={{ maxWidth: 1120, paddingTop: 48, paddingBottom: 48 }}>
          <Row style={{ rowGap: 24 }}>
            <Col lg={6}>
              <h2 style={{ fontSize:20, fontWeight:700, letterSpacing:'-0.02em', color:'#0F172A', margin:'0 0 12px' }}>How we approach it</h2>
              <div style={{ fontSize:14.5, color:'#334155', lineHeight:1.7, display:'grid', gap:12 }}>
                <p style={{ margin:0 }}>Scams and misinformation share patterns — urgent language, credential requests, authority framing, reshaped URLs. We start with transparent heuristics for those signals, then use a structured Gemini check to explain the result.</p>
                <p style={{ margin:0, color:'#475569' }}>The goal is not to replace judgment, but to give you a fast second read you can act on.</p>
              </div>
            </Col>
            <Col lg={6}>
              <div style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:12, padding:16 }}>
                <div style={{ fontSize:12, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:'#64748B', marginBottom:10 }}>What you get</div>
                <div style={{ display:'grid', gap:10 }}>
                  {[
                    { icon:<ShieldCheck size={16}/>, title:'Verdict', desc:'Safe · Suspicious · Scam with calibrated confidence.' },
                    { icon:<FileText size={16}/>, title:'Explanation', desc:'Plain language why, not just a label.' },
                    { icon:<Cpu size={16}/>, title:'Signals', desc:'Checkable cues you can verify yourself.' },
                  ].map(r=>(
                    <div key={r.title} style={{ display:'flex', gap:12, alignItems:'flex-start', background:'#FFFFFF', border:'1px solid #E2E8F0', borderRadius:8, padding:'12px 14px' }}>
                      <span style={{ width:28, height:28, borderRadius:8, background:'#FFFFFF', border:'1px solid #E2E8F0', display:'inline-flex', alignItems:'center', justifyContent:'center', color:'#0F172A', flexShrink:0 }}>{r.icon}</span>
                      <div>
                        <div style={{ fontSize:13, fontWeight:650, color:'#0F172A' }}>{r.title}</div>
                        <div style={{ fontSize:13, color:'#64748B' }}>{r.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Principles — restrained, not vague */}
      <section style={{ background:'#F8FAFC' }}>
        <Container style={{ maxWidth: 1120, paddingTop: 48, paddingBottom: 48 }}>
          <div style={{ maxWidth: 640, margin:'0 0 20px' }}>
            <h2 style={{ fontSize:20, fontWeight:700, letterSpacing:'-0.02em', color:'#0F172A', margin:0 }}>Principles</h2>
            <p style={{ fontSize:14, color:'#64748B', margin:'6px 0 0' }}>Constraints we design around.</p>
          </div>
          <Row style={{ rowGap:16 }}>
            {[
              { icon:<Lock size={16}/>, t:'Privacy by default', d:'No login, no retention. Content is validated, checked and discarded. Client history is only in your browser.' },
              { icon:<ShieldCheck size={16}/>, t:'Explain, don’t overclaim', d:'Confidence is shown as a range. Low certainty is explicit and asks you to cross-check.' },
              { icon:<FileText size={16}/>, t:'Built for speed', d:'Structured JSON and narrow prompts keep results fast, consistent and easy to scan.' },
            ].map(v=>(
              <Col key={v.t} md={4}>
                <div style={{ background:'#FFFFFF', border:'1px solid #E2E8F0', borderRadius:12, padding:18, height:'100%' }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:'#F8FAFC', border:'1px solid #E2E8F0', display:'inline-flex', alignItems:'center', justifyContent:'center', color:'#0F172A', marginBottom:10 }}>{v.icon}</div>
                  <div style={{ fontSize:14, fontWeight:650, color:'#0F172A', marginBottom:6 }}>{v.t}</div>
                  <div style={{ fontSize:13, color:'#475569', lineHeight:1.6 }}>{v.d}</div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Builder — minimal */}
      <section style={{ background:'#FFFFFF', borderTop:'1px solid #E2E8F0' }}>
        <Container style={{ maxWidth: 720, paddingTop: 32, paddingBottom: 40 }}>
          <div style={{ display:'flex', gap:14, alignItems:'center', background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:12, padding:16 }}>
            <span style={{ width:36, height:36, borderRadius:8, background:'#0F172A', display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <ShieldCheck size={18} color="#FFFFFF" />
            </span>
            <div>
              <div style={{ fontSize:13, fontWeight:650, color:'#0F172A' }}>Built by Josh Ivan Sartin — creator & developer</div>
              <div style={{ fontSize:13, color:'#64748B' }}>Focused on practical, private verification. Feedback on false verdicts helps improve the checks.</div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}
