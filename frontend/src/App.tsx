import { BrowserRouter, Routes, Route } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import Trail from "./pages/Trail"
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div className="p-4">Home (login)</div>} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Trail" element={<Trail />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App