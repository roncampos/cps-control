import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f9fafb'
    }}>
      <SignUp />
    </div>
  )
}
