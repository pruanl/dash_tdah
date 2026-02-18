import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ReportPage } from '@/pages/Report'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/report/:public_id" element={<ReportPage />} />
        <Route path="*" element={<Navigate to="/report/demo" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
