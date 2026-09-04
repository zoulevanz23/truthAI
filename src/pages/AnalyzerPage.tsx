import { Container } from 'react-bootstrap'
import InputForm from '../components/InputForm'
import { ShieldCheck } from 'lucide-react'

const AnalyzerPage = () => {
  return (
    <div style={{ background:'#F8FAFC', minHeight:'calc(100vh - 56px)' }}>
      <Container style={{ maxWidth: 1120, paddingTop: 48, paddingBottom: 64 }}>
        <div style={{ display:'flex', alignItems:'center', gap: 8, fontSize: 12, color:'#64748B', marginBottom: 12 }}>
          <span style={{ display:'inline-flex', alignItems:'center', gap: 6, background:'#FFFFFF', border:'1px solid #E2E8F0', borderRadius: 9999, padding:'4px 8px', fontWeight:600 }}>
            <ShieldCheck size={14} /> Privacy-first • No data stored
          </span>
          <span style={{ color:'#CBD5E1' }}>•</span>
          <span>Results in seconds</span>
        </div>

        <InputForm />

        <div style={{ maxWidth: 720, margin:'32px auto 0', display:'grid', gridTemplateColumns:'1fr 1fr', gap: 16 }}>
          <div style={{ background:'#FFFFFF', border:'1px solid #E2E8F0', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:'#64748B', marginBottom: 6 }}>How it works</div>
            <ol style={{ margin:0, paddingLeft: 18, fontSize:13, color:'#475569', lineHeight:1.6 }}>
              <li>Choose type and paste content</li>
              <li>We run heuristic and AI checks</li>
              <li>Get verdict, confidence and signals</li>
            </ol>
          </div>
          <div style={{ background:'#FFFFFF', border:'1px solid #E2E8F0', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:'#64748B', marginBottom: 6 }}>Trust & privacy</div>
            <p style={{ margin:0, fontSize:13, color:'#475569', lineHeight:1.6 }}>No login. Content is analyzed and discarded. Rate-limited and validated on the server. Always cross-check important decisions.</p>
          </div>
        </div>
      </Container>
    </div>
  )
}
export default AnalyzerPage
