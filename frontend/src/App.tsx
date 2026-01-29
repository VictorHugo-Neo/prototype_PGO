import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Trail from './pages/Trail';
import Profile from './pages/Profile';
// 1. IMPORTANTE: Importe a página nova aqui em cima
import StudentDetails from './pages/StudentDetails'; 
import { ChatWidget } from './components/ChatWidget';

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
          <Route path="/guidance/:id" element={<StudentDetails />} />
        </Routes>
        <ChatWidget/>
      </div>
    </BrowserRouter>
  )
}
export default App