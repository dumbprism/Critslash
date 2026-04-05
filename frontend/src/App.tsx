import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Home'
import Login from './Login'
import Loading from './Loading'
import Questions from './Questions'
import Generating from './Generating'
import Roast from './Roast'
import Recommendations from './Recommendations'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/loading" element={<Loading />} />
        <Route path="/questions" element={<Questions />} />
        <Route path="/generating" element={<Generating />} />
        <Route path="/roast" element={<Roast />} />
        <Route path="/recommendations" element={<Recommendations />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
