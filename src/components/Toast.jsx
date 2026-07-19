import { createContext, useCallback, useContext, useState } from 'react'
import Icon from './Icon.jsx'
import './Toast.css'

const ToastContext = createContext(() => {})

/** useToast() -> showToast(message, opts?) */
export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const show = useCallback(
    (message, { type = 'success', duration = 5000 } = {}) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setToasts((t) => [...t, { id, message, type }])
      window.setTimeout(() => remove(id), duration)
    },
    [remove],
  )

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-wrap" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}`}>
            <span className="toast__icon">
              <Icon name={t.type === 'success' ? 'check' : 'close'} size={18} strokeWidth={2.4} />
            </span>
            <p className="toast__msg">{t.message}</p>
            <button className="toast__close" onClick={() => remove(t.id)} aria-label="Dismiss">
              <Icon name="close" size={16} strokeWidth={2.2} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
