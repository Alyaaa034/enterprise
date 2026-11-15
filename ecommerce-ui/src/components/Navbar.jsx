
import { Link } from 'react-router-dom'

export default function Navbar({ userId, onUserChange }) {
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

        <div className="user-selector">
          <label htmlFor="user-id">User ID</label>

          <select
            id="user-id"
            value={userId}
            onChange={(event) => onUserChange(event.target.value)}
          >
            {[1, 2, 3, 4, 5].map((id) => (
              <option key={id} value={String(id)}>
                User {id}
              </option>
            ))}
          </select>
        </div>
      </div>
    </nav>
  )
}
