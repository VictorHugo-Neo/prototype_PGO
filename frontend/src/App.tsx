import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Trail from './pages/Trail';
import Profile from './pages/Profile';
import StudentDetails from './pages/StudentDetails'; 
// REMOVIDO: import { ChatWidget } ... (Não deve ficar aqui)

function App() {
  return (
    <BrowserRouter>
      <div className="relative">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element ={<Register />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/Trail" element={<Trail />} />
          <Route path ="/Profile" element={<Profile />} />
          {/* Esta rota está correta, ela passa o ID para o StudentDetails */}
          <Route path="/guidance/:id" element={<StudentDetails />} />
        </Routes>
        
        
      </div>
    </BrowserRouter>
  )
}

export default App;