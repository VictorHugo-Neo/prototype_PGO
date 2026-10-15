import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Trail from './pages/Trail';
import Profile from './pages/Profile';
import StudentDetails from './pages/StudentDetails';

export default function App() {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/trail" element={<Trail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/guidance/:id" element={<StudentDetails />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}