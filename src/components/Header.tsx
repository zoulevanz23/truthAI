import { useEffect, useState } from 'react'
import { Navbar, Nav, Container } from 'react-bootstrap'
import { Link, useLocation } from 'react-router-dom'
import { ShieldCheck, Menu, X } from 'lucide-react'
import { checkServerHealth } from '../lib/api'
import Button from './ui/Button'

const Header = () => {
  const [expanded, setExpanded] = useState(false)
  const location = useLocation()
  const [serverHealthy, setServerHealthy] = useState<boolean | null>(null)

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const ok = await checkServerHealth()
        if (isMounted) setServerHealthy(ok)
      } catch {
        if (isMounted) setServerHealthy(false)
      }
    })()
    return () => { isMounted = false }
  }, [])

  const isActive = (p: string) => location.pathname === p

  return (
    <header className="header-wrapper">
      <Navbar expand="lg" className="custom-navbar" expanded={expanded}>
        <Container style={{ maxWidth: 1280 }}>
          <Navbar.Brand as={Link} to="/" className="brand-logo">
            <span className="logo-container">
              <span style={{ display:'inline-flex', width: 28, height: 28, borderRadius: 6, background:'#0F172A', alignItems:'center', justifyContent:'center' }}>
                <ShieldCheck size={16} color="#FFFFFF" strokeWidth={2} />
              </span>
              <span className="brand-text">TruthCheck AI</span>
              <span style={{ fontSize: 11, fontWeight: 600, color:'#64748B', border:'1px solid #E2E8F0', borderRadius: 9999, padding:'2px 7px', marginLeft: 6 }}>BETA</span>
            </span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="main-nav" className="custom-toggler" onClick={() => setExpanded(!expanded)}>
            {expanded ? <X size={18} /> : <Menu size={18} />}
          </Navbar.Toggle>

          <Navbar.Collapse id="main-nav">
            <Nav className="ms-auto align-items-center" style={{ gap: 12 }}>
              <Nav.Link as={Link as any} to="/" className={`nav-link-custom ${isActive('/') ? 'active' : ''}`} onClick={() => setExpanded(false)}>Verify</Nav.Link>
              <Nav.Link as={Link as any} to="/features" className={`nav-link-custom ${isActive('/features') ? 'active' : ''}`} onClick={() => setExpanded(false)}>How it works</Nav.Link>
              <Nav.Link as={Link as any} to="/about" className={`nav-link-custom ${isActive('/about') ? 'active' : ''}`} onClick={() => setExpanded(false)}>About</Nav.Link>
              <span style={{ width: 1, height: 20, background:'#E2E8F0', margin:'0 12px', display:'inline-block' }} />
              <span aria-label="server-health" title="Server health" style={{ display:'inline-flex', alignItems:'center', gap: 6, fontSize: 12, fontWeight: 500, color: serverHealthy ? '#059669' : serverHealthy === false ? '#DC2626' : '#64748B', fontFamily:'var(--font-mono)' }}>
                <span style={{ width:7, height:7, borderRadius: 9999, background: serverHealthy ? '#059669' : serverHealthy === false ? '#DC2626' : '#CBD5E1', display:'inline-block' }} />
                {serverHealthy == null ? 'Checking' : serverHealthy ? 'Operational' : 'Offline'}
              </span>
              <Button to="/analyzer" variant="primary" onClick={() => setExpanded(false)} style={{ padding:'10px 18px', fontSize:13, marginLeft: 12 }}>Open analyzer</Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  )
}
export default Header
