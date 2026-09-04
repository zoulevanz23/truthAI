export default function Loader() {
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap: 8, fontSize: 13, color:'#475569' }}>
      <span style={{ width: 16, height: 16, borderRadius: 9999, border:'2px solid #E2E8F0', borderTopColor:'#0F172A', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
      <span>Analyzing…</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
