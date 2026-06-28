import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home } from '@/pages/Home'
import { AvisoLegal } from '@/pages/AvisoLegal'
import { Privacidad } from '@/pages/Privacidad'
import { PoliticaCookies } from '@/pages/PoliticaCookies'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/aviso-legal" element={<AvisoLegal />} />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/politica-cookies" element={<PoliticaCookies />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
