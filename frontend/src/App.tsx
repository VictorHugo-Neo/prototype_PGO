import { BrowserRouter, Routes, Route } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import Trail from "./pages/Trail"
import { ChatWidget } from "./components/ChatWidget"
import Login from "./pages/Login"
function App() {
  return (
    <BrowserRouter>
      <div className="relative">
        <Routes>
          <Route path="/" element={<Login />} />
          
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/Trail" element={<Trail />} />
        </Routes>
        <ChatWidget/>
      </div>
    </BrowserRouter>
  )
}
export default App