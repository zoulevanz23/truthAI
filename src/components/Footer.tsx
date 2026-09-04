import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
export default function Footer(){
  return (
    <footer style={{ background:'#FFFFFF', borderTop:'1px solid #E2E8F0', padding:'24px 0' }}>
      <div style={{ maxWidth: 1120, margin:'0 auto', padding:'0 16px', display:'flex', justifyContent:'space-between', gap: 16, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ display:'flex', gap: 10, alignItems:'center', fontSize: 13, color:'#64748B' }}>
          <span style={{ width:22, height:22, borderRadius:6, background:'#0F172A', display:'inline-flex', alignItems:'center', justifyContent:'center' }}><ShieldCheck size={12} color="#FFF" /></span>
          <span style={{ fontWeight:600, color:'#0F172A' }}>TruthCheck AI</span>
          <span>© {new Date().getFullYear()} • Privacy-first verification</span>
        </div>
        <div style={{ display:'flex', gap: 14, fontSize: 13 }}>
          <Link to="/features" style={{ color:'#475569' }}>How it works</Link>
          <Link to="/analyzer" style={{ color:'#475569' }}>Analyzer</Link>
          <Link to="/about" style={{ color:'#475569' }}>About</Link>
        </div>
      </div>
    </footer>
  )
}
