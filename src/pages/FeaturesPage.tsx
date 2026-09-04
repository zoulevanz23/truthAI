import { Container, Row, Col } from 'react-bootstrap'
import { ShieldCheck, Search, Link2, Mail, Newspaper } from 'lucide-react'
import Button from '../components/ui/Button'

export default function FeaturesPage() {
  return (
    <div style={{ background:'#F8FAFC' }}>
      <section style={{ background:'#FFFFFF', borderBottom:'1px solid #E2E8F0' }}>
        <Container style={{ maxWidth: 1120, paddingTop: 72, paddingBottom: 48 }}>
          <div style={{ maxWidth: 720 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'#64748B', marginBottom:12 }}>How it works</div>
            <h1 style={{ fontSize:'clamp(28px,4vw,38px)', fontWeight:750, lineHeight:1.05, letterSpacing:'-0.03em', color:'#0F172A', margin:0 }}>
              A short check with a clear output.
            </h1>
            <p style={{ fontSize:17, color:'#475569', lineHeight:1.65, marginTop:14, maxWidth: 640 }}>
              Paste what you received. Get the same structure every time — verdict, confidence, explanation and signals. No chat, no extra steps.
            </p>
          </div>
        </Container>
      </section>

      <section style={{ background:'#F8FAFC', borderBottom:'1px solid #E2E8F0' }}>
        <Container style={{ maxWidth: 1120, padding:'24px 12px' }}>
          <Row style={{ rowGap:16 }}>
            {[
              { n:'01', t:'Choose a type', d:'Message, link, article or document. Each has a tailored check.' },
              { n:'02', t:'Add context', d:'Include the full text, sender or headline for a better read.' },
              { n:'03', t:'Get the result', d:'Same format every time, built for quick decisions.' },
            ].map(s=>(
              <Col key={s.n} md={4}>
                <div style={{ background:'#FFFFFF', border:'1px solid #E2E8F0', borderRadius:12, padding:16, display:'flex', gap:12, alignItems:'flex-start' }}>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:11, fontWeight:700, color:'#2563EB', background:'#EFF6FF', border:'1px solid #DBEAFE', borderRadius:8, padding:'4px 7px', lineHeight:1 }}>{s.n}</span>
                  <div>
                    <div style={{ fontSize:14, fontWeight:650, color:'#0F172A', marginBottom:4 }}>{s.t}</div>
                    <div style={{ fontSize:13, color:'#475569', lineHeight:1.5 }}>{s.d}</div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section style={{ background:'#FFFFFF', borderBottom:'1px solid #E2E8F0' }}>
        <Container style={{ maxWidth: 1120, paddingTop: 48, paddingBottom: 32 }}>
          <h2 style={{ fontSize:18, fontWeight:700, letterSpacing:'-0.02em', color:'#0F172A', margin:'0 0 16px' }}>What gets checked</h2>
          <Row style={{ rowGap:16 }}>
            {[
              { icon:<Mail size={16}/>, title:'Message', desc:'Urgent language, credential requests and sender mismatches.' },
              { icon:<Link2 size={16}/>, title:'Link', desc:'URL shape, redirects and signals before you click.' },
              { icon:<Newspaper size={16}/>, title:'Article', desc:'Claim framing, sourcing and language that pressures a quick share.' },
            ].map(c=>(
              <Col key={c.title} md={4}>
                <div style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:12, padding:18, height:'100%' }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:'#FFFFFF', border:'1px solid #E2E8F0', display:'inline-flex', alignItems:'center', justifyContent:'center', color:'#0F172A', marginBottom:10 }}>{c.icon}</div>
                  <div style={{ fontSize:14, fontWeight:650, color:'#0F172A', marginBottom:6 }}>{c.title}</div>
                  <div style={{ fontSize:13, color:'#475569', lineHeight:1.6 }}>{c.desc}</div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section style={{ background:'#F8FAFC' }}>
        <Container style={{ maxWidth: 1120, paddingTop: 48, paddingBottom: 48 }}>
          <Row style={{ rowGap:16 }}>
            <Col lg={6}>
              <div style={{ background:'#FFFFFF', border:'1px solid #E2E8F0', borderRadius:12, padding:20, height:'100%' }}>
                <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:10 }}>
                  <span style={{ width:28, height:28, borderRadius:8, background:'#F8FAFC', border:'1px solid #E2E8F0', display:'inline-flex', alignItems:'center', justifyContent:'center', color:'#0F172A' }}><ShieldCheck size={16}/></span>
                  <div style={{ fontSize:14, fontWeight:650, color:'#0F172A' }}>Private by default</div>
                </div>
                <ul style={{ margin:0, paddingLeft:18, fontSize:13, color:'#475569', lineHeight:1.7 }}>
                  <li>No account, no storage — content is discarded.</li>
                  <li>Rate limits and basic validation on the server.</li>
                  <li>History, if shown, lives only in your browser.</li>
                </ul>
              </div>
            </Col>
            <Col lg={6}>
              <div style={{ background:'#FFFFFF', border:'1px solid #E2E8F0', borderRadius:12, padding:20, height:'100%' }}>
                <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:10 }}>
                  <span style={{ width:28, height:28, borderRadius:8, background:'#F8FAFC', border:'1px solid #E2E8F0', display:'inline-flex', alignItems:'center', justifyContent:'center', color:'#0F172A' }}><Search size={16}/></span>
                  <div style={{ fontSize:14, fontWeight:650, color:'#0F172A' }}>Consistent output</div>
                </div>
                <ul style={{ margin:0, paddingLeft:18, fontSize:13, color:'#475569', lineHeight:1.7 }}>
                  <li>Verdict with calibrated confidence.</li>
                  <li>Plain-language explanation.</li>
                  <li>Signals you can check yourself.</li>
                </ul>
              </div>
            </Col>
          </Row>
          <div style={{ textAlign:'center', marginTop:28 }}>
            <Button to="/analyzer" variant="primary">Try it now</Button>
          </div>
        </Container>
      </section>
    </div>
  )
}
