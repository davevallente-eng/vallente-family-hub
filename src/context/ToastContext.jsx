import { createContext, useContext } from 'react'
import { useToast } from '../hooks/useToast'
import { Toast } from '../components/Toast'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const { message, show } = useToast()
  return (
    <ToastContext.Provider value={show}>
      {children}
      <Toast message={message} />
    </ToastContext.Provider>
  )
}

export function useShowToast() {
  const fn = useContext(ToastContext)
  if (!fn) throw new Error('useShowToast must be inside <ToastProvider>')
  return fn
}
