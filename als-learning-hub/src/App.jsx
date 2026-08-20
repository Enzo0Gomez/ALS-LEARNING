import { useState } from 'react'
import Navbar from './components/Navbar'
import Homepage from './components/Homepage'
import Aboutpage from './components/Aboutpage'
import Teacher from './components/Teacher'

function App() {
  const [activePage, setActivePage] = useState('home')

  return (
    <>
      <Navbar activePage={activePage} onNavigate={setActivePage} />
      {activePage === 'home' && <Homepage onNavigate={setActivePage} />}
      {activePage === 'about' && <Aboutpage />}
      {activePage === 'teacher' && <Teacher />}
    </>
  )
}

export default App
