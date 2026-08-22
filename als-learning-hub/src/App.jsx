import { useEffect, useState } from 'react'

import Navbar from './components/Navbar'
import Homepage from './components/Homepage'
import Aboutpage from './components/Aboutpage'
import Teacher from './components/Teacher'
import Login from './components/Login'
import Signup from './components/Signup'
import TeacherDashboard from './components/TeacherDashboard'
import { supabase } from './lib/supabase'

function App() {
  const [activePage, setActivePage] = useState('home')

  // Test Supabase connection
  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .limit(5)

      console.log('Supabase data:', data)
      console.log('Supabase error:', error)
    }

    testConnection()
  }, [])

  return (
    <>
      {/* Navbar - always visible */}
      <Navbar
        activePage={activePage}
        onNavigate={setActivePage}
      />

      {/* Home */}
      {activePage === 'home' && (
        <Homepage onNavigate={setActivePage} />
      )}

      {/* About */}
      {activePage === 'about' && (
        <Aboutpage />
      )}

      {/* Teacher */}
      {activePage === 'teacher' && (
        <Teacher />
      )}

      {/* Login */}
      {activePage === 'login' && (
        <Login
          onSignUp={() => setActivePage('signup')}
        />
      )}

      {/* Student Sign Up */}
      {activePage === 'signup' && (
        <Signup
          onLogin={() => setActivePage('login')}
        />
      )}
      {activePage === 'teacher-dashboard' && (
        <TeacherDashboard onNavigate={setActivePage} />
      )}
    </>
  )
}

export default App