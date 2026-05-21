import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Cartao from '@/cartao/Cartao'
import '@/index.css'

// Ponto de entrada do cartão de visita digital — página autónoma, sem
// router, sem autenticação e sem ligação ao Daily Rasch interno.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Cartao />
  </StrictMode>,
)
