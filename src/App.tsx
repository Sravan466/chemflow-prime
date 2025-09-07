import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AppRouter } from './components/AppRouter'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="page-container">
          <AppRouter />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
