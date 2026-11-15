
import { Link } from 'react-router-dom'
import { formatRupiah } from '../utils/format'
import StarRating from './StarRating'

export default function ProductCard({ product }) {
  return (
    <article className="product-card">
      <div className="product-image">
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <div className="image-placeholder">Tidak ada gambar</div>
        )}
      </div>

      <div className="product-info">
        <h3>{product.name}</h3>
        <StarRating rating={product.rating} />
        <p className="price">{formatRupiah(product.price)}</p>

        <Link to={`/products/${product.id}`} className="button">
          Lihat Detail
        </Link>
      </div>
    </article>
  )
}
