import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Home from './Home'
import Login from './Login'
import Loading from './Loading'
import Questions from './Questions'
import Generating from './Generating'
import Roast from './Roast'
import Recommendations from './Recommendations'
import Auth from './Auth'
import Watchlist from './Watchlist'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/loading" element={<Loading />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/generating" element={<Generating />} />
          <Route path="/roast" element={<Roast />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/signin" element={<Auth />} />
          <Route path="/watchlist" element={<Watchlist />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
