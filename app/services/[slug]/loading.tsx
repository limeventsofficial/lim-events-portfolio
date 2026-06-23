// app/services/[slug]/loading.tsx
export default function Loading() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--cream)',
    }}>
      <span style={{
        width: 36,
        height: 36,
        border: '2.5px solid rgba(122,59,30,0.15)',
        borderTopColor: 'var(--brown)',
        borderRadius: '50%',
        display: 'block',
        animation: 'spin 0.7s linear infinite',
      }} />
    </div>
  )
}