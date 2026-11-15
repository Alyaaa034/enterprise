
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="brand">
          Toko Online
        </Link>

        <div className="nav-links">
          <Link to="/">Produk</Link>
          <Link to="/cart">Keranjang</Link>
        </div>
      </div>
    </nav>
  )
}
