import { BrowserRouter, Routes, Route } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import Trail from "./pages/Trail"
import { ChatWidget } from "./components/ChatWidget"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Profile from "./pages/Profile"

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
        </Routes>
        <ChatWidget/>
      </div>
    </BrowserRouter>
  )
}
export default App