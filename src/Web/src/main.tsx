import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './shared/localization/i18n.ts'
import { App } from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'

// Após um deploy, chunks antigos somem; telas abertas por dias (TV/quiosque) falhariam ao navegar.
// Recarrega para buscar o index.html novo, no máximo 1 vez a cada 10 s para não entrar em loop.
// Sem sessionStorage (ou dentro da trava), o erro segue o fluxo normal.
window.addEventListener('vite:preloadError', (event) => {
  const KEY = 'chunk-reload-at'
  try {
    const last = Number(sessionStorage.getItem(KEY) ?? 0)
    if (Date.now() - last > 10_000) {
      sessionStorage.setItem(KEY, String(Date.now()))
      event.preventDefault()
      window.location.reload()
    }
  } catch {
    // sessionStorage indisponível: sem trava, não arrisca loop de reload
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
