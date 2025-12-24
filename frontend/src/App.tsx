import { BrowserRouter, Routes, Route } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import Trail from "./pages/Trail"
import { ChatWidget } from "./components/ChatWidget"
function App() {
  return (
    <BrowserRouter>
      <div className="relative">
        <Routes>
          <Route path="/" element={<div className="p-4">Home (login)</div>} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/Trail" element={<Trail />} />
        </Routes>
        <ChatWidget/>
      </div>
    </BrowserRouter>
  )
}
export default App