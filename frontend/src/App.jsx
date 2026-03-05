import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Players from './pages/Players'
import PlayerDetail from './pages/PlayerDetail'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Players />} />
        <Route path="/players/:uid" element={<PlayerDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App