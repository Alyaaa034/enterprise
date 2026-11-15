
import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProductListPage from './pages/ProductListPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'

function App() {
  const [userId, setUserId] = useState(
    () => localStorage.getItem('userId') || '1',
  )

  const handleUserChange = (newUserId) => {
    localStorage.setItem('userId', newUserId)
    setUserId(newUserId)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProductListPage
              userId={userId}
              onUserChange={handleUserChange}
            />
          }
        />
        <Route
          path="/products/:id"
          element={
            <ProductDetailPage
              userId={userId}
              onUserChange={handleUserChange}
            />
          }
        />
        <Route
          path="/cart"
          element={
            <CartPage
              userId={userId}
              onUserChange={handleUserChange}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
