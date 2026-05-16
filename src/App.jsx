import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { LocationProvider } from './context/LocationContext'
import { AuthScreens } from './components/AuthScreens'
import { AppShell } from './AppShell'

export default function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <ToastProvider>
          <Gate />
        </ToastProvider>
      </LocationProvider>
    </AuthProvider>
  )
}

function Gate() {
  const { loading, signedIn, needsProfile } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--color-text-tertiary)] text-sm">
        Loading…
      </div>
    )
  }
  if (!signedIn || needsProfile) return <AuthScreens />
  return <AppShell />
}
